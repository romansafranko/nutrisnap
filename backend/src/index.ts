import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import meRoutes from "./routes/me";
import mealRoutes from "./routes/meals";

const app = express();
const PORT = process.env.PORT ?? 3000;

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL ?? "*",
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/me", meRoutes);
app.use("/meals", mealRoutes);

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- 404 ---
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint nenájdený." });
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`✅ NutriSnap backend beží na http://localhost:${PORT}`);
});

export default app;
