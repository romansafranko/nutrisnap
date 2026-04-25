import axios, { AxiosInstance } from "axios";

/**
 * NutriSnap API klient.
 *
 * Volania sú pripravené na tvoj vlastný Express + AWS RDS backend.
 * Stačí nastaviť env premennú VITE_API_BASE_URL na URL tvojho API,
 * napr. https://api.nutrisnap.tvojadomena.sk
 *
 * Ak premenná chýba alebo požiadavka zlyhá, klient používa MOCK dáta,
 * aby si mohol prezerať a testovať UI bez behajúceho backendu.
 *
 * Endpointy ktoré tvoj backend musí poskytovať:
 *   POST /auth/register     { name, email, password } -> { token, user }
 *   POST /auth/login        { email, password }       -> { token, user }
 *   GET  /me                                          -> User
 *   PATCH /me               Partial<User>             -> User
 *   POST /meals/analyze     multipart 'image'         -> AnalysisResult
 *   POST /meals             AnalysisResult            -> Meal
 *   GET  /meals                                       -> Meal[]
 *   DELETE /meals/:id                                 -> { ok: true }
 */

export type User = {
  id: string;
  name: string;
  email: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  dailyCalorieGoal: number;
};

export type MealItem = {
  name: string;
  emoji?: string;
  calories: number;
  protein: number; // g
  fat: number; // g
  carbs: number; // g
};

export type AnalysisResult = {
  imageUrl: string;
  items: MealItem[];
  totals: { calories: number; protein: number; fat: number; carbs: number };
};

export type Meal = AnalysisResult & {
  id: string;
  createdAt: string; // ISO
};

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const USE_MOCK = !BASE_URL;

const TOKEN_KEY = "nutrisnap_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL || undefined,
  timeout: 30_000,
});

client.interceptors.request.use((config) => {
  const t = tokenStore.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

/* ---------------- MOCK STORE ---------------- */

const LS = {
  user: "nutrisnap_mock_user",
  meals: "nutrisnap_mock_meals",
};

const seedUser: User = {
  id: "mock-user",
  name: "Demo používateľ",
  email: "demo@nutrisnap.app",
  age: 28,
  weightKg: 72,
  heightCm: 178,
  dailyCalorieGoal: 2200,
};

const mockDb = {
  getUser(): User {
    const raw = localStorage.getItem(LS.user);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(LS.user, JSON.stringify(seedUser));
    return seedUser;
  },
  saveUser(u: User) {
    localStorage.setItem(LS.user, JSON.stringify(u));
  },
  getMeals(): Meal[] {
    const raw = localStorage.getItem(LS.meals);
    return raw ? JSON.parse(raw) : [];
  },
  saveMeals(m: Meal[]) {
    localStorage.setItem(LS.meals, JSON.stringify(m));
  },
};

const FOOD_DB: Record<string, MealItem> = {
  pizza:    { name: "Pizza Margherita", emoji: "🍕", calories: 285, protein: 12, fat: 10, carbs: 36 },
  salad:    { name: "Zeleninový šalát", emoji: "🥗", calories: 120, protein: 4,  fat: 7,  carbs: 11 },
  chicken:  { name: "Grilované kura",   emoji: "🍗", calories: 230, protein: 31, fat: 11, carbs: 0  },
  rice:     { name: "Basmati ryža",     emoji: "🍚", calories: 205, protein: 4,  fat: 1,  carbs: 45 },
  avocado:  { name: "Avokádo",          emoji: "🥑", calories: 160, protein: 2,  fat: 15, carbs: 9  },
  burger:   { name: "Hovädzí burger",   emoji: "🍔", calories: 540, protein: 25, fat: 31, carbs: 40 },
  pasta:    { name: "Cestoviny",        emoji: "🍝", calories: 320, protein: 12, fat: 8,  carbs: 52 },
  cola:     { name: "Coca-Cola 330ml",  emoji: "🥤", calories: 139, protein: 0,  fat: 0,  carbs: 35 },
  apple:    { name: "Jablko",           emoji: "🍎", calories: 95,  protein: 0,  fat: 0,  carbs: 25 },
  egg:      { name: "Vajce",            emoji: "🥚", calories: 78,  protein: 6,  fat: 5,  carbs: 1  },
};

const mockAnalyze = async (file: File): Promise<AnalysisResult> => {
  await new Promise((r) => setTimeout(r, 1400));
  const keys = Object.keys(FOOD_DB);
  const count = 2 + Math.floor(Math.random() * 2);
  const picks: MealItem[] = [];
  const used = new Set<string>();
  while (picks.length < count) {
    const k = keys[Math.floor(Math.random() * keys.length)];
    if (used.has(k)) continue;
    used.add(k);
    picks.push(FOOD_DB[k]);
  }
  const totals = picks.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein: acc.protein + i.protein,
      fat: acc.fat + i.fat,
      carbs: acc.carbs + i.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
  return {
    imageUrl: URL.createObjectURL(file),
    items: picks,
    totals,
  };
};

/* ---------------- PUBLIC API ---------------- */

export const api = {
  isMock: USE_MOCK,

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const user = { ...mockDb.getUser(), email };
      mockDb.saveUser(user);
      return { token: "mock-token", user };
    }
    const { data } = await client.post("/auth/login", { email, password });
    return data;
  },

  async register(name: string, email: string, password: string) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const user = { ...mockDb.getUser(), name, email };
      mockDb.saveUser(user);
      return { token: "mock-token", user };
    }
    const { data } = await client.post("/auth/register", { name, email, password });
    return data;
  },

  async me(): Promise<User> {
    if (USE_MOCK) return mockDb.getUser();
    const { data } = await client.get("/me");
    return data;
  },

  async updateMe(patch: Partial<User>): Promise<User> {
    if (USE_MOCK) {
      const u = { ...mockDb.getUser(), ...patch };
      mockDb.saveUser(u);
      return u;
    }
    const { data } = await client.patch("/me", patch);
    return data;
  },

  async analyzeMeal(file: File): Promise<AnalysisResult> {
    if (USE_MOCK) return mockAnalyze(file);
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await client.post("/meals/analyze", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async saveMeal(result: AnalysisResult): Promise<Meal> {
    if (USE_MOCK) {
      const meal: Meal = {
        ...result,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const meals = [meal, ...mockDb.getMeals()];
      mockDb.saveMeals(meals);
      return meal;
    }
    const { data } = await client.post("/meals", result);
    return data;
  },

  async listMeals(): Promise<Meal[]> {
    if (USE_MOCK) return mockDb.getMeals();
    const { data } = await client.get("/meals");
    return data;
  },

  async deleteMeal(id: string): Promise<void> {
    if (USE_MOCK) {
      mockDb.saveMeals(mockDb.getMeals().filter((m) => m.id !== id));
      return;
    }
    await client.delete(`/meals/${id}`);
  },
};