import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating?: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}

export default function RatingStars({ rating, onChange, disabled }: RatingStarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          className={cn(
            "text-yellow-400 transition-colors",
            !disabled && "hover:text-yellow-500",
            disabled && "cursor-default"
          )}
        >
          <Star
            className={cn(
              "h-6 w-6",
              (hover || rating) && hover! >= star || rating! >= star
                ? "fill-current"
                : "fill-none"
            )}
          />
        </button>
      ))}
    </div>
  );
}
