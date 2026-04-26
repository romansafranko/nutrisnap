import { Router, Response } from "express";
import * as multer from "multer";
const multerInstance = (multer as any).default || multer;
import prisma from "../db/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { detectFoodLabels } from "../services/vision";
import { getNutrition } from "../services/nutrition";
import { AnalysisResult } from "../types";

const router = Router();

// Multer — uloží obrázok do pamäte (buffer), nie na disk
const upload = multerInstance({
  storage: multerInstance.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Povolené sú len obrázky."));
    }
  },
});

// POST /meals/analyze
// Prijme obrázok → Google Vision → Nutritionix → vráti AnalysisResult
router.post(
  "/analyze",
  authMiddleware,
  upload.single("image"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "Chýba obrázok." });
      return;
    }

    try {
      // 1. Google Vision API — rozpoznaj čo je na obrázku
      const labels = await detectFoodLabels(req.file.buffer);
      console.log("Vision labels:", labels);

      // 2. Nutritionix API — získaj výživové hodnoty
      const items = await getNutrition(labels);

      // 3. Vypočítaj súčty
      const totals = items.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          fat: acc.fat + item.fat,
          carbs: acc.carbs + item.carbs,
        }),
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
      );

      // imageUrl — v produkcii by si uploadoval na S3, teraz vrátime base64
      const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const result: AnalysisResult = { imageUrl, items, totals };
      res.json(result);
    } catch (err) {
      console.error("Chyba pri analýze:", err);
      res.status(500).json({ error: "Analýza zlyhala. Skús to znova." });
    }
  }
);

// POST /meals — uloží jedlo do DB
router.post("/", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { imageUrl, items, totals } = req.body as AnalysisResult;

  if (!imageUrl || !items || !totals) {
    res.status(400).json({ error: "Neplatné dáta jedla." });
    return;
  }

  const meal = await prisma.meal.create({
    data: {
      userId: req.userId!,
      imageUrl,
      calories: totals.calories,
      protein: totals.protein,
      fat: totals.fat,
      carbs: totals.carbs,
      items: {
        create: items.map((item) => ({
          name: item.name,
          emoji: item.emoji,
          calories: item.calories,
          protein: item.protein,
          fat: item.fat,
          carbs: item.carbs,
        })),
      },
    },
    include: { items: true },
  });

  res.status(201).json({
    id: meal.id,
    imageUrl: meal.imageUrl,
    createdAt: meal.createdAt.toISOString(),
    items: meal.items,
    totals: {
      calories: meal.calories,
      protein: meal.protein,
      fat: meal.fat,
      carbs: meal.carbs,
    },
  });
});

// GET /meals — história jedál prihláseného používateľa
router.get("/", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const meals = await prisma.meal.findMany({
    where: { userId: req.userId! },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    meals.map((meal) => ({
      id: meal.id,
      imageUrl: meal.imageUrl,
      createdAt: meal.createdAt.toISOString(),
      items: meal.items,
      totals: {
        calories: meal.calories,
        protein: meal.protein,
        fat: meal.fat,
        carbs: meal.carbs,
      },
    }))
  );
});

// DELETE /meals/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const meal = await prisma.meal.findUnique({ where: { id: req.params.id } });

  if (!meal || meal.userId !== req.userId) {
    res.status(404).json({ error: "Jedlo nenájdené." });
    return;
  }

  await prisma.meal.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;