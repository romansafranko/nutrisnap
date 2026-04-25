import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Flame, Calendar } from "lucide-react";
import { api, Meal } from "@/lib/api";
import { format, isToday, isThisWeek, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Filter = "all" | "today" | "week";

const History = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const load = () => {
    setLoading(true);
    api.listMeals().then((m) => {
      setMeals(m);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (filter === "today") return meals.filter((m) => isToday(parseISO(m.createdAt)));
    if (filter === "week") return meals.filter((m) => isThisWeek(parseISO(m.createdAt), { weekStartsOn: 1 }));
    return meals;
  }, [meals, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Meal[]>();
    filtered.forEach((m) => {
      const key = format(parseISO(m.createdAt), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const remove = async (id: string) => {
    await api.deleteMeal(id);
    toast.success("Jedlo zmazané");
    load();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">História</h1>
          <p className="text-muted-foreground mt-2">Všetky tvoje analyzované jedlá.</p>
        </div>
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {([
            { id: "all", label: "Všetko" },
            { id: "week", label: "Tento týždeň" },
            { id: "today", label: "Dnes" },
          ] as { id: Filter; label: string }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-smooth ${
                filter === f.id ? "bg-background shadow-soft" : "text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center bg-card/50">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Žiadne jedlá v tomto období.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([day, dayMeals]) => {
            const total = dayMeals.reduce((s, m) => s + m.totals.calories, 0);
            return (
              <section key={day}>
                <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-border">
                  <h2 className="font-display text-lg font-semibold capitalize">
                    {format(parseISO(day), "EEEE, d. MMMM", { locale: sk })}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    Spolu <span className="text-accent font-semibold">{Math.round(total)}</span> kcal
                  </span>
                </div>
                <ul className="space-y-3">
                  {dayMeals.map((m, idx) => (
                    <motion.li
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border shadow-soft"
                    >
                      <img src={m.imageUrl} alt="" className="h-20 w-20 rounded-xl object-cover bg-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(m.createdAt), "HH:mm")}
                        </p>
                        <p className="font-medium truncate">
                          {m.items.map((i) => i.name).join(" · ")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(m.totals.protein)}P · {Math.round(m.totals.carbs)}C · {Math.round(m.totals.fat)}F
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 text-accent">
                          <Flame className="h-4 w-4" />
                          <span className="font-display text-xl font-semibold">{Math.round(m.totals.calories)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => remove(m.id)} aria-label="Zmazať">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;