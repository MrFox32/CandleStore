import React, { useState, useEffect, useRef } from 'react';
import styles from './ProductImageCarousel.module.css';

export default function ProductImageCarousel({ images, altText }) {
  // Normalize images to array: if string is passed, make it an array. Filter out null/undefined.
  const imageArray = Array.isArray(images) ? images : [images].filter(Boolean);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const timeoutRef = useRef(null);

  const handleNext = (e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    e.stopPropagation();
    if (imageArray.length <= 1) return;
    setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
    showDotsTemporarily();
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (imageArray.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
    showDotsTemporarily();
  };

  const showDotsTemporarily = () => {
    setIsSwitching(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsSwitching(false);
    }, 2000); // 2 seconds delay
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (imageArray.length === 0) {
    return <div className={styles.wrapper} style={{backgroundColor: 'var(--secondary-color)'}}></div>;
  }

  const hasMultiple = imageArray.length > 1;
  // Dots are visible if mouse is over the container OR if user recently switched via click/touch
  const showDots = isHovered || isSwitching;

  return (
    <div 
      className={styles.wrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageArray.map((imgUrl, index) => (
        <img
          key={`${imgUrl}-${index}`}
          src={imgUrl}
          alt={`${altText} - фото ${index + 1}`}
          className={`${styles.image} ${index === currentIndex ? styles.imageActive : ''}`}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {hasMultiple && (
        <>
          <div className={styles.clickZones}>
            <div 
              className={styles.zoneLeft} 
              onClick={handlePrev} 
              aria-label="Попереднє фото"
            ></div>
            <div 
              className={styles.zoneRight} 
              onClick={handleNext} 
              aria-label="Наступне фото"
            ></div>
          </div>

          <div className={`${styles.dotsContainer} ${showDots ? styles.dotsVisible : ''}`}>
            {imageArray.map((_, index) => (
              <div 
                key={index} 
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
