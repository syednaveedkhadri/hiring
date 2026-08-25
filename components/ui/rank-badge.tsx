import { cn } from "@/lib/utils";
import { Medal } from "lucide-react";

interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
};

const rankStyles = {
  1: {
    bg: "bg-gradient-to-br from-amber-400 to-yellow-500",
    text: "text-white",
    border: "border-amber-300",
  },
  2: {
    bg: "bg-gradient-to-br from-gray-300 to-gray-400",
    text: "text-gray-900",
    border: "border-gray-300",
  },
  3: {
    bg: "bg-gradient-to-br from-orange-400 to-amber-600",
    text: "text-white",
    border: "border-orange-300",
  },
  default: {
    bg: "bg-gradient-to-br from-gray-200 to-gray-300",
    text: "text-gray-700",
    border: "border-gray-300",
  },
};

export function RankBadge({ rank, size = "md", className }: RankBadgeProps) {
  const styles = rankStyles[rank as 1 | 2 | 3] || rankStyles.default;

  if (rank <= 3) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold shadow-lg border-2",
          sizeStyles[size],
          styles.bg,
          styles.text,
          styles.border,
          className
        )}
      >
        <Medal className="h-4 w-4 mr-0.5" />
        {rank}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold border-2",
        sizeStyles[size],
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      {rank}
    </div>
  );
}
