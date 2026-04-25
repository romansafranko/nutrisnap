import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Sparkles, History, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import heroImg from "@/assets/hero-bowl.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@nutrisnap.app");
  const [password, setPassword] = useState("demo1234");
  const [busy, setBusy] = useState(false);

  if (user) {
    navigate("/dashboard", { replace: true });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name || "Nový používateľ", email, password);
      toast.success("Vitaj v NutriSnap 🥗");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Prihlásenie zlyhalo. Skontroluj údaje.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="container flex items-center justify-between py-6">
        <Logo />
        <Button variant="ghost" onClick={() => setMode("login")}>Prihlásiť sa</Button>
      </header>

      <section className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-8 pb-20 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-7"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-soft text-accent text-sm font-medium">
            <Sparkles className="h-4 w-4" /> AI rozpoznávanie jedla
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] text-balance">
            Odfoť tanier. <br />
            <span className="text-primary italic">Spočítaj kalórie.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md text-balance">
            NutriSnap rozpozná čo máš na fotke a okamžite vypočíta výživové
            hodnoty každej zložky. Bez zdĺhavého zapisovania.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            {[
              { icon: Camera, label: "Foto za 1s" },
              { icon: Sparkles, label: "AI analýza" },
              { icon: Target, label: "Denné ciele" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-background/60 border border-border">
                <f.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-gradient-warm opacity-20 blur-3xl rounded-full" aria-hidden />
          <div className="relative rounded-[2rem] overflow-hidden shadow-card">
            <img
              src={heroImg}
              alt="Zdravá miska s grilovaným kuracím mäsom, avokádom a quinoou"
              width={1280}
              height={1280}
              className="w-full h-auto"
            />
            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/95 backdrop-blur-md shadow-card">
              <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Rozpoznané</p>
                <p className="text-sm font-semibold truncate">Kura · avokádo · quinoa · paradajka</p>
              </div>
              <span className="font-display text-xl font-semibold text-accent">612</span>
              <span className="text-xs text-muted-foreground -ml-1">kcal</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container pb-24">
        <div className="max-w-md mx-auto bg-card rounded-3xl shadow-card p-8 border border-border">
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-smooth ${
                mode === "login" ? "bg-background shadow-soft" : "text-muted-foreground"
              }`}
            >
              Prihlásenie
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-smooth ${
                mode === "register" ? "bg-background shadow-soft" : "text-muted-foreground"
              }`}
            >
              Registrácia
            </button>
          </div>

          <h2 className="font-display text-2xl font-semibold mb-1">
            {mode === "login" ? "Vitaj späť" : "Vytvor si účet"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login" ? "Pokračuj k svojmu nutričnému prehľadu." : "Začni sledovať svoje jedlá za pár sekúnd."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Meno</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jana Nováková" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Heslo</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={busy}>
              {busy ? "Moment..." : mode === "login" ? "Prihlásiť sa" : "Vytvoriť účet"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Landing;