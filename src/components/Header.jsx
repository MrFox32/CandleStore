import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

// Inline SVG logo — no PNG artifacts, scales perfectly
function LogoMark() {
  return (
    <svg width="180" height="36" viewBox="0 0 180 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="CandleStore">
      {/* Flame icon */}
      <path
        d="M14 2C14 2 20 9 20 15.5C20 17.1 19.6 18.5 18.9 19.6C20.5 17.8 21.2 15.4 21 13.2C21 13.2 23.5 16 23.5 18.5C23.5 22.1 19.6 25 14 25C8.4 25 4.5 22.1 4.5 18.5C4.5 16 7 13.2 7 13.2C6.8 15.4 7.5 17.8 9.1 19.6C8.4 18.5 8 17.1 8 15.5C8 9 14 2 14 2Z"
        fill="#8E7060"
      />
      {/* Inner flame highlight */}
      <path
        d="M14 12C14 12 11.5 15.5 11.5 18C11.5 19.4 12.6 20.5 14 20.5C15.4 20.5 16.5 19.4 16.5 18C16.5 15.5 14 12 14 12Z"
        fill="#FDFBF9"
        opacity="0.6"
      />
      {/* Wordmark */}
      <text
        x="32"
        y="25"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="20"
        fontWeight="500"
        fill="#2A2A2A"
        letterSpacing="0.3"
      >
        CandleStore.
      </text>
    </svg>
  );
}

export default function Header() {
  const { totalCount, setIsOpen } = useCart();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContent}`}>
        <a href="#" className={styles.logoLink} aria-label="CandleStore — на головну">
          <LogoMark />
        </a>
        <nav className={styles.nav}>
          <a href="#showcase" className={styles.navLink}>Набори</a>
          <a href="#contact" className={styles.navLink}>Замовити</a>
          <button
            className={styles.cartBtn}
            onClick={() => setIsOpen(true)}
            aria-label="Відкрити кошик"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalCount > 0 && (
              <span className={styles.badge}>{totalCount}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
