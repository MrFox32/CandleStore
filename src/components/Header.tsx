import logo from '../assets/logo.svg';
import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

export default function Header() {
  const { totalCount, setIsOpen } = useCart();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContent}`}>
        <a href="#" className={styles.logoLink} aria-label="Flama Mia — на головну">
          <img src={logo} className={styles.logoImg} alt="Flama Mia Logo" />
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
