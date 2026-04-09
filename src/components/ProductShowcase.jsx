import styles from './ProductShowcase.module.css';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductShowcase() {
  const { addItem } = useCart();

  return (
    <section id="showcase" className={`section-padding ${styles.showcase}`}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Подарункові Набори</h2>
          <p className={styles.subtitle}>Оберіть ідеальний варіант для себе або близьких</p>
        </div>
        
        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={product.image} alt={product.name} className={styles.image} loading="lazy" />
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>{product.price} ₴</span>
                  <button
                    className={styles.buyBtn}
                    onClick={() => addItem(product)}
                  >
                    + До кошика
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
