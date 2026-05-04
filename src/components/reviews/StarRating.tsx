import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  hoveredRating?: number;
  onHover?: (rating: number) => void;
  onLeave?: () => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = 20,
  interactive = false,
  onRate,
  hoveredRating = 0,
  onHover,
  onLeave,
}) => {
  const GOLD = '#C9A84C';
  const EMPTY = '#2E4A63';

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={onLeave}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const active = hoveredRating ? starValue <= hoveredRating : starValue <= rating;
        const half = !active && starValue - 0.5 <= rating && !hoveredRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starValue)}
            onMouseEnter={() => interactive && onHover?.(starValue)}
            className={`relative transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            {half ? (
              <span className="relative inline-block" style={{ width: size, height: size }}>
                <Star
                  size={size}
                  fill={EMPTY}
                  stroke="none"
                  className="absolute inset-0"
                />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: '50%' }}
                >
                  <Star size={size} fill={GOLD} stroke="none" />
                </span>
              </span>
            ) : (
              <Star
                size={size}
                fill={active ? GOLD : EMPTY}
                stroke="none"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
