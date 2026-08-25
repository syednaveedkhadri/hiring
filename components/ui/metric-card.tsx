import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  variant?: "default" | "ai" | "success" | "warning" | "info";
  className?: string;
}

const variantStyles = {
  default: {
    card: "border-border/50 hover:border-border transition-colors",
    iconBg: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
    iconColor: "text-slate-600 dark:text-slate-400",
    value: "text-foreground",
  },
  ai: {
    card: "border-primary/20 hover:border-primary/30 transition-colors ai-glow",
    iconBg: "bg-gradient-to-br from-primary/10 to-primary/20",
    iconColor: "text-primary",
    value: "text-gradient-ai",
  },
  success: {
    card: "border-[oklch(0.55_0.15_150)]/20 hover:border-[oklch(0.55_0.15_150)]/30 transition-colors",
    iconBg: "bg-gradient-to-br from-[oklch(0.55_0.15_150)]/10 to-[oklch(0.55_0.15_150)]/20",
    iconColor: "text-[oklch(0.55_0.15_150)]",
    value: "score-excellent",
  },
  warning: {
    card: "border-[oklch(0.68_0.16_60)]/20 hover:border-[oklch(0.68_0.16_60)]/30 transition-colors",
    iconBg: "bg-gradient-to-br from-[oklch(0.68_0.16_60)]/10 to-[oklch(0.68_0.16_60)]/20",
    iconColor: "text-[oklch(0.68_0.16_60)]",
    value: "score-moderate",
  },
  info: {
    card: "border-[oklch(0.58_0.20_220)]/20 hover:border-[oklch(0.58_0.20_220)]/30 transition-colors",
    iconBg: "bg-gradient-to-br from-[oklch(0.58_0.20_220)]/10 to-[oklch(0.58_0.20_220)]/20",
    iconColor: "text-[oklch(0.58_0.20_220)]",
    value: "score-good",
  },
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn("card-depth hover:card-depth-hover transition-all p-6", styles.card, className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-3">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn("text-4xl font-bold tracking-tight", styles.value)}>
              {value}
            </h3>
            {trend && (
              <span className={cn(
                "text-sm font-medium",
                trend.positive ? "text-[oklch(0.55_0.15_150)]" : "text-[oklch(0.55_0.22_25)]"
              )}>
                {trend.value}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </Card>
  );
}
