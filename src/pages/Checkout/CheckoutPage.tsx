import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabaseClient';
import styles from './CheckoutPage.module.css';
import { NovaPoshtaSelects } from '../../components/NovaPoshtaSelects';
import { novaPoshtaService, NPCity, NPWarehouse } from '../../services/novaPoshta';

interface CheckoutFormData {
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  email: string;
  city: string;
  warehouse: string;
  ukr_city?: string;
  ukr_address?: string;
  ukr_index?: string;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'nova-poshta' | 'ukrposhta'>('nova-poshta');
  const [formData, setFormData] = useState<CheckoutFormData>({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: '',
    email: '',
    city: '',
    warehouse: '',
    ukr_city: '',
    ukr_address: '',
    ukr_index: ''
  });
  const [npCityRef, setNpCityRef] = useState<string>('');
  const [npWarehouseRef, setNpWarehouseRef] = useState<string>('');
  const [shippingEstimate, setShippingEstimate] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <h2>Ваш кошик порожній</h2>
        <button className="btn" onClick={() => navigate('/')}>Повернутися до покупок</button>
      </div>
    );
  }

  // Update shipping estimate when city changes
  React.useEffect(() => {
    if (shippingMethod === 'nova-poshta' && npCityRef) {
      const totalWeight = items.reduce((sum, item) => sum + (item.weight_grams || 300) * item.qty, 0) / 1000;
      novaPoshtaService.calculateCost(npCityRef, totalWeight, totalPrice)
        .then(setShippingEstimate)
        .catch(console.error);
    } else {
      setShippingEstimate(null);
    }
  }, [npCityRef, totalPrice, items, shippingMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.lastName || !formData.firstName || !formData.phone) {
      alert('Будь ласка, заповніть контактні дані');
      return;
    }

    if (shippingMethod === 'nova-poshta') {
      if (!formData.city || !formData.warehouse) {
        alert('Будь ласка, оберіть місто та відділення Нової Пошти');
        return;
      }
    } else {
      if (!formData.ukr_city || !formData.ukr_address || !formData.ukr_index) {
        alert('Будь ласка, заповніть дані для доставки Укрпоштою');
        return;
      }
    }

    setLoading(true);

    try {
      const customerFullName = `${formData.lastName} ${formData.firstName} ${formData.middleName}`.trim();
      
      const finalCity = shippingMethod === 'nova-poshta' ? formData.city : formData.ukr_city;
      const finalAddress = shippingMethod === 'nova-poshta' ? formData.warehouse : `${formData.ukr_index}, ${formData.ukr_address}`;

      // 1. Створюємо замовлення
      const { data: order, error: orderError } = await (supabase
        .from('orders')
        .insert([{
          customer_name: customerFullName,
          customer_phone: formData.phone,
          customer_email: formData.email,
          shipping_city: finalCity,
          shipping_address: finalAddress,
          total_price: totalPrice,
          np_city_ref: shippingMethod === 'nova-poshta' ? (npCityRef || null) : null,
          np_warehouse_ref: shippingMethod === 'nova-poshta' ? (npWarehouseRef || null) : null,
          shipping_estimate: shippingEstimate || null
        }])
        .select()
        .single() as any);

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
    } catch (error: any) {
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
                <div className={styles.nameGrid}>
                  <input 
                    type="text" placeholder="Прізвище" 
                    value={formData.lastName} onChange={e => setFormData(prev => ({...prev, lastName: e.target.value}))} 
                    required 
                  />
                  <input 
                    type="text" placeholder="Ім'я" 
                    value={formData.firstName} onChange={e => setFormData(prev => ({...prev, firstName: e.target.value}))} 
                    required 
                  />
                  <input 
                    type="text" placeholder="По батькові (необов'язково)" className={styles.fullWidth}
                    value={formData.middleName} onChange={e => setFormData(prev => ({...prev, middleName: e.target.value}))} 
                  />
                </div>
                <input 
                  type="tel" placeholder="Номер телефону" 
                  value={formData.phone} onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))} 
                  required 
                />
                <input 
                  type="email" placeholder="Email (необов'язково)" 
                  value={formData.email} onChange={e => setFormData(prev => ({...prev, email: e.target.value}))} 
                />
              </div>

              <div className={styles.fieldGroup}>
                <h3>Оберіть спосіб доставки</h3>
                <div className={styles.shippingSelector}>
                  <button 
                    type="button"
                    className={`${styles.shippingTab} ${shippingMethod === 'nova-poshta' ? styles.shippingTabActive : ''}`}
                    onClick={() => setShippingMethod('nova-poshta')}
                  >
                    🚀 Нова Пошта
                  </button>
                  <button 
                    type="button"
                    className={`${styles.shippingTab} ${shippingMethod === 'ukrposhta' ? styles.shippingTabActive : ''}`}
                    onClick={() => setShippingMethod('ukrposhta')}
                  >
                    🕊️ Укрпошта
                  </button>
                </div>

                {shippingMethod === 'nova-poshta' ? (
                  <NovaPoshtaSelects 
                    onCityChange={(city) => {
                      setFormData(prev => ({...prev, city: city?.Description || ''}));
                      setNpCityRef(city?.Ref || '');
                    }}
                    onWarehouseChange={(warehouse) => {
                      setFormData(prev => ({...prev, warehouse: warehouse?.Description || ''}));
                      setNpWarehouseRef(warehouse?.Ref || '');
                    }}
                  />
                ) : (
                  <div className={styles.ukrposhtaFields}>
                    <input 
                      type="text" placeholder="Місто / Населений пункт" 
                      value={formData.ukr_city} onChange={e => setFormData(prev => ({...prev, ukr_city: e.target.value}))} 
                      required 
                    />
                    <div className={styles.nameGrid}>
                      <input 
                        type="text" placeholder="Індекс" className={styles.indexField}
                        value={formData.ukr_index} onChange={e => setFormData(prev => ({...prev, ukr_index: e.target.value}))} 
                        required 
                      />
                      <input 
                        type="text" placeholder="Адреса (вулиця, будинок, квартира)" 
                        value={formData.ukr_address} onChange={e => setFormData(prev => ({...prev, ukr_address: e.target.value}))} 
                        required 
                      />
                    </div>
                  </div>
                )}
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

            {shippingMethod === 'nova-poshta' && shippingEstimate && (
              <div className={styles.summaryShippingNotice}>
                <div className={styles.shippingLabel}>Доставка Новою Поштою:</div>
                <div className={styles.shippingValue}>~{shippingEstimate} ₴</div>
                <div className={styles.shippingExtra}>(сплачується окремо при отриманні)</div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
