type Props = {
  label: string;
  value: number;
  unit: string;
  color: "calorie" | "protein" | "carbs" | "fat";
  max?: number;
};

const colorMap = {
  calorie: "bg-calorie",
  protein: "bg-protein",
  carbs: "bg-carbs",
  fat: "bg-fat",
};

export const MacroBar = ({ label, value, unit, color, max = 100 }: Props) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="font-display text-lg font-semibold">
          {Math.round(value)}
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} rounded-full transition-smooth`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};