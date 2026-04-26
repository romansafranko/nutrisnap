export type MealItem = {
  name: string;
  emoji?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type AnalysisResult = {
  imageUrl: string;
  items: MealItem[];
  totals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};
