import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalorieRing } from "@/components/CalorieRing";
import { MacroBar } from "@/components/MacroBar";
import { useAuth } from "@/context/AuthContext";
import { api, Meal } from "@/lib/api";
import { format, isToday } from "date-fns";
import { sk } from "date-fns/locale";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listMeals().then((m) => {
      setMeals(m);
      setLoading(false);
    });
  }, []);

  const today = meals.filter((m) => isToday(new Date(m.createdAt)));
  const todayTotals = today.reduce(
    (acc, m) => ({
      calories: acc.calories + m.totals.calories,
      protein: acc.protein + m.totals.protein,
      fat: acc.fat + m.totals.fat,
      carbs: acc.carbs + m.totals.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
  const recent = meals.slice(0, 3);
  const goal = user?.dailyCalorieGoal ?? 2000;

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
            {format(new Date(), "EEEE, d. MMMM", { locale: sk })}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">
            Ahoj, {user?.name?.split(" ")[0] ?? "priateľ"} 👋
          </h1>
        </div>
        <Button variant="hero" size="lg" onClick={() => navigate("/upload")}>
          <Camera className="h-5 w-5" /> Odfotiť jedlo
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid lg:grid-cols-[auto_1fr] gap-8 p-6 md:p-10 rounded-3xl bg-card shadow-card border border-border"
      >
        <div className="flex justify-center">
          <CalorieRing current={todayTotals.calories} goal={goal} />
        </div>
        <div className="space-y-5 self-center w-full">
          <h2 className="font-display text-2xl font-semibold">Dnešný príjem</h2>
          <div className="space-y-4">
            <MacroBar label="Bielkoviny" value={todayTotals.protein} unit="g" color="protein" max={150} />
            <MacroBar label="Sacharidy" value={todayTotals.carbs} unit="g" color="carbs" max={300} />
            <MacroBar label="Tuky" value={todayTotals.fat} unit="g" color="fat" max={80} />
          </div>
        </div>
      </motion.div>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold">Posledné jedlá</h2>
          <button onClick={() => navigate("/history")} className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
            Celá história <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center bg-card/50">
            <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Zatiaľ žiadne jedlá. Začni prvou fotkou.</p>
            <Button variant="hero" onClick={() => navigate("/upload")}>Nahrať fotku</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {recent.map((m, idx) => (
              <motion.button
                key={m.id}
                onClick={() => navigate("/history")}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="text-left bg-card rounded-2xl overflow-hidden border border-border shadow-soft hover:shadow-card transition-smooth group"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={m.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-smooth" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(m.createdAt), "HH:mm · d.M.")}
                  </p>
                  <p className="font-medium truncate">
                    {m.items.map((i) => i.name).join(" · ")}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-accent">
                    <Flame className="h-4 w-4" />
                    <span className="font-display text-lg font-semibold">{Math.round(m.totals.calories)}</span>
                    <span className="text-xs text-muted-foreground">kcal</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;