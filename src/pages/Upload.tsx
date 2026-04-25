import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Sparkles, Save, RotateCcw, Flame, Drumstick, Wheat, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MacroBar } from "@/components/MacroBar";
import { api, AnalysisResult } from "@/lib/api";
import { toast } from "sonner";

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setAnalyzing(true);
    try {
      const r = await api.analyzeMeal(f);
      setResult(r);
    } catch {
      toast.error("Analýza zlyhala. Skús to znova.");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"] },
    maxFiles: 1,
  });

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await api.saveMeal(result);
      toast.success("Jedlo uložené do histórie 🎉");
      navigate("/history");
    } catch {
      toast.error("Uloženie zlyhalo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Analýza jedla</h1>
        <p className="text-muted-foreground mt-2">Nahraj fotku tanieru — zvyšok nechaj na nás.</p>
      </div>

      <AnimatePresence mode="wait">
        {!file && (
          <motion.div
            key="drop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={`relative rounded-3xl border-2 border-dashed p-12 md:p-20 text-center cursor-pointer transition-smooth ${
              isDragActive
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border hover:border-primary/60 bg-card"
            }`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow mb-6 animate-float">
              <UploadCloud className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">
              {isDragActive ? "Pusti fotku tu" : "Pretiahni alebo klikni"}
            </h2>
            <p className="text-muted-foreground">JPG, PNG alebo WEBP do 10 MB</p>
          </motion.div>
        )}

        {file && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-card">
              <div className="relative aspect-square bg-muted">
                <img
                  src={result?.imageUrl ?? URL.createObjectURL(file)}
                  alt="Nahraté jedlo"
                  className="w-full h-full object-cover"
                />
                {analyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-hero flex items-center justify-center animate-pulse shadow-glow">
                      <Sparkles className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <p className="font-medium">Analyzujem jedlo...</p>
                    <p className="text-sm text-muted-foreground">AI rozpoznáva ingrediencie</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {result && (
                <>
                  <div className="rounded-3xl bg-card border border-border shadow-card p-6">
                    <h3 className="font-display text-xl font-semibold mb-4">Rozpoznané ingrediencie</h3>
                    <ul className="space-y-2">
                      {result.items.map((i, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="flex items-center justify-between py-3 border-b border-border last:border-0"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-2xl">{i.emoji ?? "🍽️"}</span>
                            <span className="font-medium">{i.name}</span>
                          </span>
                          <span className="font-display text-lg font-semibold text-accent">
                            {Math.round(i.calories)} <span className="text-xs text-muted-foreground">kcal</span>
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-6 shadow-card">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-display text-xl font-semibold">Spolu</h3>
                      <span className="font-display text-4xl font-semibold">
                        {Math.round(result.totals.calories)}
                        <span className="text-base font-normal opacity-80 ml-1">kcal</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Drumstick, label: "Bielkoviny", val: result.totals.protein },
                        { icon: Wheat, label: "Sacharidy", val: result.totals.carbs },
                        { icon: Droplet, label: "Tuky", val: result.totals.fat },
                      ].map((m) => (
                        <div key={m.label} className="rounded-2xl bg-primary-foreground/10 p-3 backdrop-blur-sm">
                          <m.icon className="h-4 w-4 mb-1 opacity-80" />
                          <p className="text-xs opacity-80">{m.label}</p>
                          <p className="font-display text-xl font-semibold">
                            {Math.round(m.val)}<span className="text-xs font-normal opacity-80">g</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={reset} className="flex-1">
                      <RotateCcw className="h-4 w-4" /> Nová fotka
                    </Button>
                    <Button variant="hero" size="lg" onClick={save} disabled={saving} className="flex-1">
                      <Save className="h-4 w-4" /> {saving ? "Ukladám..." : "Uložiť do histórie"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Upload;