import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabaseClient';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    warehouse: ''
  });

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <h2>Ваш кошик порожній</h2>
        <button className="btn" onClick={() => navigate('/')}>Повернутися до покупок</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Створюємо замовлення
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          shipping_city: formData.city,
          shipping_address: formData.warehouse,
          total_price: totalPrice
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Додаємо товари в замовлення
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Успіх
      clearCart();
      navigate('/success');
    } catch (error) {
      alert('Помилка оформлення: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkoutLayout}>
      <div className="container section-padding">
        <Link to="/" className={styles.backLink}>← Повернутися на головну сторінку</Link>
        <h1>Оформлення замовлення</h1>
        
        <div className={styles.grid}>
          <section className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.checkoutForm}>
              <div className={styles.fieldGroup}>
                <h3>Контактні дані</h3>
                <input 
                  type="text" placeholder="Ваше Ім'я та Прізвище" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
                <input 
                  type="tel" placeholder="Номер телефону" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                  required 
                />
                <input 
                  type="email" placeholder="Email (необов'язково)" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className={styles.fieldGroup}>
                <h3>Доставка (Нова Пошта)</h3>
                <input 
                  type="text" placeholder="Місто" 
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} 
                  required 
                />
                <input 
                  type="text" placeholder="Відділення або Поштомат №" 
                  value={formData.warehouse} onChange={e => setFormData({...formData, warehouse: e.target.value})} 
                  required 
                />
              </div>

              <button type="submit" className={`btn ${styles.submitBtn}`} disabled={loading}>
                {loading ? 'Оформлюємо...' : `Замовити на ${totalPrice} ₴`}
              </button>
            </form>
          </section>

          <aside className={styles.summarySection}>
            <h3>Ваше замовлення</h3>
            <div className={styles.summaryList}>
              {items.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <img src={item.image || item.image_url} alt={item.name} />
                  <div className={styles.summaryInfo}>
                    <p>{item.name} x {item.qty}</p>
                    <span>{item.price * item.qty} ₴</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span>Разом до оплати:</span>
              <strong>{totalPrice} ₴</strong>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
