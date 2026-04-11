import { useNavigate } from 'react-router-dom';
import styles from './CheckoutPage.module.css'; // Reusing some layout styles

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.emptyContainer}>
      <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✨</div>
        <h1>Дякуємо за замовлення!</h1>
        <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>
          Ваша заявка прийнята. Ми зв'яжемося з вами найближчим часом для підтвердження деталей та відправки.
        </p>
        <button className="btn" onClick={() => navigate('/')}>Повернутися в магазин</button>
      </div>
    </div>
  );
}
