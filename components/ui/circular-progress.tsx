import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  className?: string;
  variant?: "default" | "ai" | "success" | "warning";
}

const variantColors = {
  default: {
    track: "stroke-gray-200 dark:stroke-gray-700",
    progress: "stroke-primary",
  },
  ai: {
    track: "stroke-indigo-100 dark:stroke-indigo-900/30",
    progress: "stroke-indigo-600 dark:stroke-indigo-500",
  },
  success: {
    track: "stroke-emerald-100 dark:stroke-emerald-900/30",
    progress: "stroke-emerald-600 dark:stroke-emerald-500",
  },
  warning: {
    track: "stroke-amber-100 dark:stroke-amber-900/30",
    progress: "stroke-amber-600 dark:stroke-amber-500",
  },
};

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  className,
  variant = "ai",
}: CircularProgressProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const colors = variantColors[variant];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={colors.track}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn(colors.progress, "transition-all duration-500 ease-out")}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
