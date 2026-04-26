import axios from "axios";
import { MealItem } from "../types";

const USDA_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

const FALLBACK_DB: Record<string, Omit<MealItem, "name">> = {
  pizza:      { emoji: "🍕", calories: 285, protein: 12, fat: 10, carbs: 36 },
  salad:      { emoji: "🥗", calories: 120, protein: 4,  fat: 7,  carbs: 11 },
  chicken:    { emoji: "🍗", calories: 230, protein: 31, fat: 11, carbs: 0  },
  rice:       { emoji: "🍚", calories: 205, protein: 4,  fat: 1,  carbs: 45 },
  avocado:    { emoji: "🥑", calories: 160, protein: 2,  fat: 15, carbs: 9  },
  burger:     { emoji: "🍔", calories: 540, protein: 25, fat: 31, carbs: 40 },
  pasta:      { emoji: "🍝", calories: 320, protein: 12, fat: 8,  carbs: 52 },
  bread:      { emoji: "🍞", calories: 265, protein: 9,  fat: 3,  carbs: 49 },
  egg:        { emoji: "🥚", calories: 78,  protein: 6,  fat: 5,  carbs: 1  },
  apple:      { emoji: "🍎", calories: 95,  protein: 0,  fat: 0,  carbs: 25 },
  banana:     { emoji: "🍌", calories: 89,  protein: 1,  fat: 0,  carbs: 23 },
  cheese:     { emoji: "🧀", calories: 402, protein: 25, fat: 33, carbs: 1  },
  tomato:     { emoji: "🍅", calories: 18,  protein: 1,  fat: 0,  carbs: 4  },
  sandwich:   { emoji: "🥪", calories: 340, protein: 15, fat: 14, carbs: 38 },
  soup:       { emoji: "🍲", calories: 180, protein: 8,  fat: 6,  carbs: 24 },
  steak:      { emoji: "🥩", calories: 271, protein: 26, fat: 18, carbs: 0  },
  sushi:      { emoji: "🍣", calories: 200, protein: 10, fat: 2,  carbs: 38 },
  pancake:    { emoji: "🥞", calories: 227, protein: 6,  fat: 7,  carbs: 38 },
  coffee:     { emoji: "☕", calories: 5,   protein: 0,  fat: 0,  carbs: 1  },
  orange:     { emoji: "🍊", calories: 62,  protein: 1,  fat: 0,  carbs: 15 },
};

function getFoodEmoji(name: string): string {
  const emojiMap: Record<string, string> = {
    pizza: "🍕", salad: "🥗", chicken: "🍗", rice: "🍚", burger: "🍔",
    pasta: "🍝", bread: "🍞", egg: "🥚", apple: "🍎", banana: "🍌",
    cheese: "🧀", tomato: "🍅", steak: "🥩", sushi: "🍣", coffee: "☕",
    avocado: "🥑", sandwich: "🥪", soup: "🍲", pancake: "🥞", orange: "🍊",
  };
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (name.toLowerCase().includes(key)) return emoji;
  }
  return "🍽️";
}

async function fetchNutritionFromUSDA(query: string): Promise<MealItem | null> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    console.warn("Chýba USDA_API_KEY v .env");
    return null;
  }

  try {
    const response = await axios.get(USDA_URL, {
      params: {
        query,
        api_key: apiKey,
        pageSize: 1,
        dataType: "Survey (FNDDS)",
      },
      timeout: 8000,
    });

    const foods = response.data.foods;
    if (!foods || foods.length === 0) return null;

    const food = foods[0];
    const nutrients = food.foodNutrients as Array<{ nutrientName: string; value: number }>;

    const get = (name: string) =>
      Math.round(nutrients.find((n) => n.nutrientName === name)?.value ?? 0);

    return {
      name: food.description,
      emoji: getFoodEmoji(food.description),
      calories: get("Energy"),
      protein: get("Protein"),
      fat: get("Total lipid (fat)"),
      carbs: get("Carbohydrate, by difference"),
    };
  } catch (err) {
    console.warn(`USDA API zlyhalo pre "${query}":`, err);
    return null;
  }
}

export async function getNutrition(labels: string[]): Promise<MealItem[]> {
  const foodKeywords = [
    "food", "dish", "meal", "cuisine", "ingredient", "fruit", "vegetable",
    "meat", "bread", "pasta", "rice", "pizza", "burger", "salad", "soup",
    "chicken", "beef", "pork", "fish", "egg", "cheese", "milk", "coffee",
    "cake", "dessert", "snack", "sandwich", "sushi", "noodle", "steak",
  ];

  const foodLabels = labels.filter((label) =>
    foodKeywords.some((kw) => label.includes(kw)) ||
    Object.keys(FALLBACK_DB).some((kw) => label.includes(kw))
  );

  if (foodLabels.length === 0) {
    return [{
      name: "Neidentifikované jedlo",
      emoji: "🍽️",
      calories: 300,
      protein: 10,
      fat: 10,
      carbs: 40,
    }];
  }

  const toQuery = foodLabels.slice(0, 4);

  const results = await Promise.all(
    toQuery.map(async (label): Promise<MealItem> => {
      const usdaResult = await fetchNutritionFromUSDA(label);
      if (usdaResult) return usdaResult;

      const match = Object.entries(FALLBACK_DB).find(([key]) => label.includes(key));
      if (match) return { name: label, ...match[1] };

      return {
        name: label,
        emoji: "🍽️",
        calories: 200,
        protein: 8,
        fat: 8,
        carbs: 25,
      };
    })
  );

  return results;
}