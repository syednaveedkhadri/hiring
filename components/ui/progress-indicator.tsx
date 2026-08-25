import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ai" | "success" | "warning";
  className?: string;
}

const sizeStyles = {
  sm: {
    height: "h-1.5",
    text: "text-xs",
  },
  md: {
    height: "h-2",
    text: "text-sm",
  },
  lg: {
    height: "h-3",
    text: "text-base",
  },
};

const variantStyles = {
  default: {
    bg: "bg-muted",
    fill: "bg-primary",
  },
  ai: {
    bg: "bg-primary/10",
    fill: "bg-gradient-to-r from-primary to-[oklch(0.58_0.20_260)]",
  },
  success: {
    bg: "bg-[oklch(0.55_0.15_150)]/10",
    fill: "bg-[oklch(0.55_0.15_150)]",
  },
  warning: {
    bg: "bg-[oklch(0.68_0.16_60)]/10",
    fill: "bg-[oklch(0.68_0.16_60)]",
  },
};

export function ProgressIndicator({
  value,
  max,
  label,
  showPercentage = true,
  size = "md",
  variant = "default",
  className,
}: ProgressIndicatorProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && <span className={cn("font-medium text-muted-foreground", sizes.text)}>{label}</span>}
          {showPercentage && (
            <span className={cn("font-semibold tabular-nums", sizes.text)}>
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full overflow-hidden", styles.bg, sizes.height)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", styles.fill)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {value !== undefined && max !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{value}</span> of {max}
          </span>
        </div>
      )}
    </div>
  );
}
