import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../db/prisma";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Meno musí mať aspoň 2 znaky"),
  email: z.string().email("Neplatný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email je už registrovaný." });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      dailyCalorieGoal: user.dailyCalorieGoal,
    },
  });
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neplatné údaje." });
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Nesprávny email alebo heslo." });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Nesprávny email alebo heslo." });
    return;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      dailyCalorieGoal: user.dailyCalorieGoal,
    },
  });
});

export default router;