import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className={cn("flex gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const isFilled = i < rating;
        return (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              "transition-colors",
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-muted-foreground/40",
              interactive && "cursor-pointer hover:text-yellow-400 hover:fill-yellow-400/50"
            )}
            onClick={() => handleClick(i)}
          />
        );
      })}
    </div>
  );
}
