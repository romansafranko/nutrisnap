import { Leaf } from "lucide-react";

type Props = { size?: "sm" | "md" | "lg"; withWordmark?: boolean };

export const Logo = ({ size = "md", withWordmark = true }: Props) => {
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const text = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dim} rounded-2xl bg-gradient-hero shadow-glow flex items-center justify-center`}>
        <Leaf className="h-1/2 w-1/2 text-primary-foreground" strokeWidth={2.5} />
      </div>
      {withWordmark && (
        <span className={`font-display font-semibold tracking-tight ${text} text-foreground`}>
          Nutri<span className="text-primary">Snap</span>
        </span>
      )}
    </div>
  );
};