type Props = {
  current: number;
  goal: number;
  size?: number;
};

export const CalorieRing = ({ current, goal, size = 240 }: Props) => {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(current / Math.max(goal, 1), 1);
  const offset = circumference * (1 - pct);
  const remaining = Math.max(goal - current, 0);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#calorieGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-5xl font-semibold text-foreground">
          {Math.round(current)}
        </span>
        <span className="text-sm text-muted-foreground mt-1">/ {goal} kcal</span>
        <span className="mt-3 text-xs uppercase tracking-wider text-primary font-semibold">
          {remaining > 0 ? `${remaining} zostáva` : "cieľ dosiahnutý"}
        </span>
      </div>
    </div>
  );
};