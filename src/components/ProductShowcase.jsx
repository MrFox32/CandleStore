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
        // ДОДАЄМО MOCK-ДАНІ для тестування каруселі:
        const dataWithMockGallery = data.map((prod, index) => {
          let images = [prod.image_url || prod.image];
          // Додаємо тестові фото для перших двох товарів
          if (index === 0) {
            images.push('https://images.unsplash.com/photo-1602058448348-18eaf3a9cfa3?w=600&h=600&fit=crop');
          } else if (index === 1) {
            images.push('https://images.unsplash.com/photo-1620608518659-3fb78b4081c7?w=600&h=600&fit=crop');
            images.push('https://images.unsplash.com/photo-1616053860264-b04331a4cc3b?w=600&h=600&fit=crop');
          }
          return { ...prod, images };
        });
        
        setProducts(dataWithMockGallery);
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
                <ProductImageCarousel images={product.images || [product.image_url || product.image]} altText={product.name} />
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
