import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: {
    container: "h-10 w-10",
    text: "text-sm",
    label: "text-[10px]",
  },
  md: {
    container: "h-14 w-14",
    text: "text-lg",
    label: "text-xs",
  },
  lg: {
    container: "h-20 w-20",
    text: "text-2xl",
    label: "text-sm",
  },
};

function getScoreColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return "score-excellent";
  if (percentage >= 70) return "score-good";
  if (percentage >= 50) return "score-moderate";
  return "score-poor";
}

function getScoreBg(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return "bg-[oklch(0.55_0.15_150)]/10 border-[oklch(0.55_0.15_150)]/20";
  if (percentage >= 70) return "bg-[oklch(0.58_0.20_220)]/10 border-[oklch(0.58_0.20_220)]/20";
  if (percentage >= 50) return "bg-[oklch(0.68_0.16_60)]/10 border-[oklch(0.68_0.16_60)]/20";
  return "bg-[oklch(0.55_0.22_25)]/10 border-[oklch(0.55_0.22_25)]/20";
}

export function ScoreBadge({
  score,
  maxScore = 100,
  size = "md",
  showLabel = true,
  className,
}: ScoreBadgeProps) {
  const sizes = sizeStyles[size];
  const scoreColor = getScoreColor(score, maxScore);
  const scoreBg = getScoreBg(score, maxScore);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className={cn(
        "rounded-full border-2 flex items-center justify-center font-bold",
        sizes.container,
        scoreBg
      )}>
        <span className={cn(sizes.text, scoreColor)}>{score}</span>
      </div>
      {showLabel && (
        <span className={cn("text-muted-foreground font-medium uppercase tracking-wide", sizes.label)}>
          Score
        </span>
      )}
    </div>
  );
}
