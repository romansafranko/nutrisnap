import { useEffect, useState } from "react";
import { Save, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    age: "",
    weightKg: "",
    heightCm: "",
    dailyCalorieGoal: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      age: user.age?.toString() ?? "",
      weightKg: user.weightKg?.toString() ?? "",
      heightCm: user.heightCm?.toString() ?? "",
      dailyCalorieGoal: user.dailyCalorieGoal.toString(),
    });
  }, [user]);

  const calcGoal = () => {
    const age = Number(form.age);
    const weight = Number(form.weightKg);
    const height = Number(form.heightCm);
    if (!age || !weight || !height) {
      toast.error("Vyplň vek, váhu a výšku.");
      return;
    }
    // Mifflin-St Jeor pre muža (zjednodušené), x 1.4 sedavá aktivita
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const goal = Math.round((bmr * 1.4) / 10) * 10;
    setForm((f) => ({ ...f, dailyCalorieGoal: goal.toString() }));
    toast.success(`Vypočítaný cieľ: ${goal} kcal`);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await api.updateMe({
        name: form.name,
        age: form.age ? Number(form.age) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        dailyCalorieGoal: Number(form.dailyCalorieGoal) || 2000,
      });
      setUser(updated);
      toast.success("Profil uložený");
    } catch {
      toast.error("Uloženie zlyhalo.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Profil</h1>
        <p className="text-muted-foreground mt-2">Tvoje údaje a denný kalorický cieľ.</p>
      </div>

      <div className="rounded-3xl bg-card border border-border shadow-card p-6 md:p-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Meno</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user.email} disabled />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="age">Vek</Label>
            <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weight">Váha (kg)</Label>
            <Input id="weight" type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="height">Výška (cm)</Label>
            <Input id="height" type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-soft border border-border p-5">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="goal">Denný kalorický cieľ</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="goal"
                  type="number"
                  value={form.dailyCalorieGoal}
                  onChange={(e) => setForm({ ...form, dailyCalorieGoal: e.target.value })}
                />
                <span className="text-sm text-muted-foreground">kcal</span>
              </div>
            </div>
            <Button variant="outline" onClick={calcGoal}>
              <Calculator className="h-4 w-4" /> Vypočítať
            </Button>
          </div>
        </div>

        <Button variant="hero" size="lg" onClick={save} disabled={saving} className="w-full">
          <Save className="h-4 w-4" /> {saving ? "Ukladám..." : "Uložiť zmeny"}
        </Button>
      </div>
    </div>
  );
};

export default Profile;