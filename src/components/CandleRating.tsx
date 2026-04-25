import React from 'react';
import styles from './CandleRating.module.css';

interface StarIconProps {
  fillPercent?: number;
  size?: number;
}

const StarIcon: React.FC<StarIconProps> = ({ fillPercent = 100, size = 20 }) => {
  return (
    <div className={styles.starWrapper} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.starIcon}
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="currentColor"
        />
      </svg>
      {fillPercent > 0 && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.starIconActive}
          style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="currentColor"
          />
        </svg>
      )}
    </div>
  );
};

interface CandleRatingProps {
  rating?: number;
  size?: number;
  showNumber?: boolean;
}

export default function CandleRating({ rating = 0, size = 18, showNumber = false }: CandleRatingProps) {
  const normalizedRating = Math.max(0, Math.min(5, rating));
  
  return (
    <div className={styles.ratingContainer}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((index) => {
          let fill = 0;
          if (normalizedRating >= index) {
            fill = 100;
          } else if (normalizedRating > index - 1) {
            fill = (normalizedRating - (index - 1)) * 100;
          }
          
          return <StarIcon key={index} fillPercent={fill} size={size} />;
        })}
      </div>
      {showNumber && (
        <span className={styles.ratingValue}>{normalizedRating.toFixed(1)}</span>
      )}
    </div>
  );
}
