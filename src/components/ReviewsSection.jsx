import React from 'react';
import styles from './ReviewsSection.module.css';

const reviews = [
  {
    id: 1,
    name: 'Олена К.',
    text: 'Дуже затишна свічка! Аромат розкривається поступово і заповнює всю кімнату. Обов\'язково замовлю ще для затишних вечорів.',
    rating: 5,
    date: '12 Березня, 2026'
  },
  {
    id: 2,
    name: 'Андрій М.',
    text: 'Шукав подарунок мамі, вибір випав на Cozy Corner. Упаковка просто неймовірна, навіть не треба було нічого додавати. Мама в захваті!',
    rating: 5,
    date: '5 Квітня, 2026'
  },
  {
    id: 3,
    name: 'Тетяна В.',
    text: 'Свічки горять дуже довго та рівномірно. Видно, що зроблено з любов\'ю до своєї справи. Дякую за таку красу у моєму домі.',
    rating: 5,
    date: '28 Березня, 2026'
  }
];

const StarRating = ({ rating }) => {
  return (
    <div className={styles.stars}>
      {[...Array(5)].map((_, i) => (
        <svg 
          key={i} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill={i < rating ? "var(--primary-color)" : "none"} 
          stroke="var(--primary-color)"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

export default function ReviewsSection() {
  return (
    <section id="reviews" className={`section-padding ${styles.reviewsSection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Відгуки наших клієнтів</h2>
          <p className={styles.sectionSubtitle}>Ми цінуємо ваші враження та натхнення</p>
        </div>
        
        <div className={styles.grid}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {review.name.charAt(0)}
                </div>
                <div className={styles.authorInfo}>
                  <h3 className={styles.authorName}>{review.name}</h3>
                  <p className={styles.date}>{review.date}</p>
                </div>
              </div>
              <StarRating rating={review.rating} />
              <p className={styles.text}>"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
