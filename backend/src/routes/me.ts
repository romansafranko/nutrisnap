import { Router, Response } from "express";
import { z } from "zod";
import prisma from "../db/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  age: z.number().int().min(1).max(120).optional(),
  weightKg: z.number().min(1).max(500).optional(),
  heightCm: z.number().min(50).max(300).optional(),
  dailyCalorieGoal: z.number().int().min(500).max(10000).optional(),
});

// GET /me
router.get("/", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) {
    res.status(404).json({ error: "Používateľ nenájdený." });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    dailyCalorieGoal: user.dailyCalorieGoal,
  });
});

// PATCH /me
router.patch("/", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: parsed.data,
  });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    dailyCalorieGoal: user.dailyCalorieGoal,
  });
});

export default router;
