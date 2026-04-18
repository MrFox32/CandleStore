import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './CandleRating.module.css';

const LottieFlame = ({ fillPercent = 100, size = 32 }) => {
  // We want the flame itself to be the visible part.
  // The animation at https://lottie.host/.../sr8WFABmZC.lottie is a full candle.
  // The flame occupies roughly the top 1/3.
  return (
    <div className={styles.flameWrapper} style={{ width: size * 0.8, height: size * 1.3 }}>
      {/* Background / Ghost Flame (Very low opacity) */}
      <div className={styles.emptyFlame}>
        <svg viewBox="0 0 24 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C12 2 10 5 10 7C10 9 11 10 12 10C13 10 14 9 14 7C14 5 12 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
      
        <div 
          className={styles.lottieContainer}
          style={{ 
            clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
          }}
        >
          <div className={styles.lottieScaler}>
            <DotLottieReact
              src="https://lottie.host/443d2491-a1f3-4022-8ca5-a8a730a6d4cd/sr8WFABmZC.lottie"
              loop
              autoplay
              speed={0.4}
            />
          </div>
      </div>
    </div>
  );
};

export default function CandleRating({ rating = 0, size = 32, showNumber = false }) {
  const normalizedRating = Math.max(0, Math.min(5, rating));
  
  return (
    <div className={styles.ratingContainer}>
      <div className={styles.candles}>
        {[1, 2, 3, 4, 5].map((index) => {
          let fill = 0;
          if (normalizedRating >= index) {
            fill = 100;
          } else if (normalizedRating > index - 1) {
            fill = (normalizedRating - (index - 1)) * 100;
          }
          
          return <LottieFlame key={index} fillPercent={fill} size={size} />;
        })}
      </div>
      {showNumber && (
        <span className={styles.ratingValue}>{normalizedRating.toFixed(1)}</span>
      )}
    </div>
  );
}
