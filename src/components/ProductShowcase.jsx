import { useEffect, useState } from 'react';
import styles from './ProductShowcase.module.css';
import { products as staticProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import ProductImageCarousel from './ProductImageCarousel';

export default function ProductShowcase() {
  const { addItem } = useCart();
  const [products, setProducts] = useState(staticProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
      } else if (data && data.length > 0) {
        setProducts(data);
      } else if (data && data.length === 0) {
        // Якщо база порожня, можна залишити статику або занулити
        // setProducts([]); 
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <div className="container" style={{padding: '40px', textAlign: 'center'}}>Завантаження каталог...</div>;

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
                <ProductImageCarousel 
                  images={product.images || [product.image_url || product.image]} 
                  altText={product.name} 
                  productId={product.id}
                />
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
