import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import ProductImageCarousel from '../../components/ProductImageCarousel';
import CandleRating from '../../components/CandleRating';
import styles from './ProductPage.module.css';
import { Product } from '../../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when opening the page
    window.scrollTo(0, 0);

    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
      } else if (data) {
        setProduct(data as Product);
      }
      setLoading(false);
    }
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return <main className={styles.loadingContainer}><span>Завантаження товару...</span></main>;
  }

  if (!product) {
    return (
      <main className={styles.notFoundContainer}>
        <h2>Товар не знайдено</h2>
        <Link to="/" className="btn btn-primary">Повернутися на головну</Link>
      </main>
    );
  }

  const images = product.images || [product.image_url || product.image].filter(Boolean) as string[];

  return (
    <main className={styles.productPage}>
      <div className="container">
        <Link to="/" className={styles.backLink}>← Назад до каталогу</Link>
        
        <div className={styles.grid}>
          <div className={styles.imageSection}>
            <div className={styles.carouselWrapper}>
              <ProductImageCarousel images={images} altText={product.name} />
            </div>
          </div>
          
          <div className={styles.infoSection}>
            <span className={styles.categoryBadge}>{product.category || 'Подарунковий набір'}</span>
            <h1 className={styles.title}>{product.name}</h1>
            <div className={styles.ratingSummary}>
              <CandleRating rating={product.rating || 4.8} size={32} showNumber={true} />
              <span className={styles.reviewsCount}>(12 відгуків)</span>
            </div>
            <p className={styles.price}>{product.price} ₴</p>
            
            <div className={styles.divider}></div>
            
            <div className={styles.description}>
              <h3>Опис товару</h3>
              <p>{product.description}</p>
            </div>
            
            <div className={styles.detailsList}>
              {product.weight_grams && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Вага:</span>
                  <span className={styles.detailValue}>{product.weight_grams} г</span>
                </div>
              )}
              {product.length_cm && product.width_cm && product.height_cm && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Габарити:</span>
                  <span className={styles.detailValue}>{product.length_cm} × {product.width_cm} × {product.height_cm} см</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Наявність:</span>
                <span className={styles.detailValue}>
                  {product.stock_quantity && product.stock_quantity > 0 ? (
                    <span className={styles.inStock}>В наявності ({product.stock_quantity} шт)</span>
                  ) : (
                    <span className={styles.outOfStock}>Немає в наявності</span>
                  )}
                </span>
              </div>
            </div>

            <button 
              className={styles.addToCartBtn}
              onClick={() => addItem(product)}
              disabled={!product.stock_quantity || product.stock_quantity <= 0}
            >
              {product.stock_quantity && product.stock_quantity > 0 ? '+ ДОДАТИ В КОШИК' : 'НЕМАЄ В НАЯВНОСТІ'}
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>Відгуки покупців</h2>
            <div className={styles.overallRating}>
              <span className={styles.bigRating}>{product.rating || 4.8}</span>
              <CandleRating rating={product.rating || 4.8} size={40} />
              <span className={styles.basedOn}>На основі 12 відгуків</span>
            </div>
          </div>

          <div className={styles.reviewsList}>
            {[
              { id: 1, author: 'Марина', rating: 5, comment: 'Неймовірний аромат! Свічка горить дуже довго, а запах лаванди розслабляє після робочого дня. Упаковка — це окремий вид мистецтва.', date: '3 дні тому' },
              { id: 2, author: 'Олег', rating: 4.5, comment: 'Дуже гарний набір. Брав на подарунок дівчині, вона в захваті. Зірочку зняв за невелику затримку в доставці, але якість свічок це компенсує.', date: '1 тиждень тому' },
              { id: 3, author: 'Юлія', rating: 5, comment: 'Це вже моя третя покупка в Flama Mia. Натуральний віск — це те, що я шукала. Ніякого хімічного запаху, тільки чиста насолода.', date: '2 тижні тому' }
            ].map(review => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewAuthor}>{review.author}</span>
                  <span className={styles.reviewDate}>{review.date}</span>
                </div>
                <div className={styles.reviewRating}>
                  <CandleRating rating={review.rating} size={20} showNumber={true} />
                </div>
                <p className={styles.reviewComment}>"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
