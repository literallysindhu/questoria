import React from 'react';
import { Star } from 'lucide-react';
import { playHover } from '../utils/audio';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onSelect?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  stars,
  maxStars = 5,
  size = 20,
  interactive = false,
  onSelect,
}) => {
  return (
    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
      {Array.from({ length: maxStars }).map((_, idx) => {
        const rating = idx + 1;
        const isFilled = rating <= stars;
        
        return (
          <Star
            key={idx}
            size={size}
            fill={isFilled ? "var(--color-gold)" : "rgba(255,255,255,0.1)"}
            color={isFilled ? "var(--color-gold)" : "rgba(255,255,255,0.2)"}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              filter: isFilled ? 'drop-shadow(0 0 4px var(--color-gold-glow))' : 'none',
            }}
            onMouseEnter={() => {
              if (interactive) playHover();
            }}
            onClick={() => {
              if (interactive && onSelect) {
                onSelect(rating);
              }
            }}
          />
        );
      })}
    </div>
  );
};
export default StarRating;
