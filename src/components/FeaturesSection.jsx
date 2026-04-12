import React from 'react';
import styles from './FeaturesSection.module.css';

const features = [
  {
    title: '100% Соєвий віск',
    description: 'Натурально, екологічно та безпечно. Наші свічки не виділяють шкідливих речовин при горіннi.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 4c1 2 2 4.1 2 7a9 9 0 0 1-18 0"/>
      </svg>
    )
  },
  {
    title: 'Душа в кожній деталі',
    description: 'Ми обожнюємо свою справу. Кожна продана свічка для нас особлива, адже ми вкладаємо в неї частинку серця.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    )
  },
  {
    title: 'Преміум аромати',
    description: 'Тільки сертифіковані аромаолії, що створюють стійкий, глибокий та терапевтичний аромат у домі.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v3m0 14v3M5 12H2m20 0h-3m3.5-6.5L19 9M5 19l-3.5 3.5m0-17L5 9m14 10 3.5 3.5"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    )
  },
  {
    title: 'Готовий подарунок',
    description: 'Ми дбаємо про крафтову упаковку, щоб ваша покупка була готовим подарунком для себе чи близьких.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H4v4"/>
        <rect width="20" height="12" x="2" y="12" rx="2"/>
        <path d="M12 22V12m-5-4a2.5 2.5 0 0 1 0-5c2 0 3 2 5 5 2-3 3-5 5-5a2.5 2.5 0 0 1 0 5"/>
      </svg>
    )
  }
];

export default function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Чому обирають Cozy Corner?</h2>
        </div>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                {feature.icon}
              </div>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.text}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
