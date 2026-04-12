import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    weight_grams: '',
    length_cm: '',
    width_cm: '',
    height_cm: '',
    is_active: true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // for forcing input clear
  const [existingImages, setExistingImages] = useState([]); // store existing URLs
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProducts();
        fetchOrders();
      }
    });
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setProducts(data || []);
    setLoading(false);
  }

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setOrders(data || []);
  }

  async function updateOrderStatus(orderId, status) {
    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    if (error) alert(error.message);
    else fetchOrders();
  }

  async function updatePaymentStatus(orderId, status) {
    const { error } = await supabase.from('orders').update({ payment_status: status }).eq('id', orderId);
    if (error) alert(error.message);
    else fetchOrders();
  }

  async function handleSubmitProduct(e) {
    e.preventDefault();
    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    let uploadedUrls = [...existingImages]; // Keep old images

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('candle-images')
          .upload(filePath, file);

        if (uploadError) {
          setErrorMessage(`Помилка Storage (фото ${file.name}): ` + uploadError.message + `. Можливо не налаштовані RLS політики доступу або бакет не існує?`);
          setUploading(false);
          return; // Stop upload process and don't save to DB
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('candle-images')
            .getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
      }
    }

    const image_url = uploadedUrls.length > 0 ? uploadedUrls[0] : '';

    const productPayload = {
      ...formData,
      image_url,
      images: uploadedUrls,
      price: parseFloat(formData.price)
    };

    console.log("Відправка даних у Supabase:", productPayload);

    let error;
    if (editingProductId) {
      const { error: updateError } = await supabase.from('products').update(productPayload).eq('id', editingProductId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('products').insert([productPayload]);
      error = insertError;
    }

    if (error) {
      setErrorMessage('Помилка збереження: ' + error.message);
    } else {
      setSuccessMessage(editingProductId ? 'Товар успішно оновлено!' : 'Товар успішно додано!');
      resetForm();
      fetchProducts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setUploading(false);
  }

  function resetForm() {
    setFormData({ name: '', description: '', price: '', stock_quantity: '', category: '', weight_grams: '', length_cm: '', width_cm: '', height_cm: '', is_active: true });
    setImageFiles([]);
    setFileInputKey(Date.now());
    setExistingImages([]);
    setEditingProductId(null);
  }

  function handleEditClick(product) {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock_quantity: product.stock_quantity || '',
      category: product.category || '',
      weight_grams: product.weight_grams || '',
      length_cm: product.length_cm || '',
      width_cm: product.width_cm || '',
      height_cm: product.height_cm || '',
      is_active: product.is_active !== undefined ? product.is_active : true
    });
    setExistingImages(product.images || [product.image_url].filter(Boolean));
    setEditingProductId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRemoveExistingImage(index) {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  }

  async function handleDelete(id) {
    if (!confirm('Видалити цей товар?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchProducts();
  }

  if (!session) return <div className={styles.adminContainer}><p>Завантаження сесії...</p></div>;

  return (
    <div className={styles.dashboardLayout}>
      <header className={styles.navHeader}>
        <div className="container">
          <div className={styles.navContent}>
            <div className={styles.brand}>
              <h1>Admin Panel</h1>
              <nav className={styles.tabs}>
                <button 
                  className={activeTab === 'products' ? styles.activeTab : ''} 
                  onClick={() => setActiveTab('products')}
                >
                  Товари
                </button>
                <button 
                  className={activeTab === 'orders' ? styles.activeTab : ''} 
                  onClick={() => setActiveTab('orders')}
                >
                  Замовлення ({orders.filter(o => o.order_status === 'Нове').length})
                </button>
              </nav>
            </div>
            <button className="btn btn-outline" onClick={() => supabase.auth.signOut()}>Вийти</button>
          </div>
        </div>
      </header>

      <main className="container section-padding">
        {activeTab === 'products' ? (
          <div className={styles.grid}>
            {/* Products Form & List */}
            <section className={styles.formContainer}>
              <h2>{editingProductId ? 'Редагувати товар' : 'Додати новий товар'}</h2>
              <form onSubmit={handleSubmitProduct} className={styles.addForm}>
                <input type="text" placeholder="Назва товару" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <textarea placeholder="Опис" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                <div className={styles.row}>
                  <input type="number" placeholder="Ціна (₴)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  <input type="number" placeholder="Кількість (шт)" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} required />
                </div>
                <div className={styles.row}>
                  <input type="text" placeholder="Категорія" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                  <input type="number" placeholder="Вага (г)" value={formData.weight_grams} onChange={e => setFormData({...formData, weight_grams: e.target.value})} required />
                </div>
                <p className={styles.label}>Габарити пакування (см):</p>
                <div className={styles.row}>
                  <input type="number" placeholder="Д" value={formData.length_cm} onChange={e => setFormData({...formData, length_cm: e.target.value})} required />
                  <input type="number" placeholder="Ш" value={formData.width_cm} onChange={e => setFormData({...formData, width_cm: e.target.value})} required />
                  <input type="number" placeholder="В" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} required />
                </div>
                <div className={styles.fileInput}>
                  <label>Додати фото (можна декілька):</label>
                  <input key={fileInputKey} type="file" multiple accept="image/*" onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setImageFiles(files);
                  }} />
                </div>
                {errorMessage && (
                  <div style={{ color: 'red', marginBottom: '10px', fontSize: '0.9rem', backgroundColor: '#ffe5e5', padding: '10px', borderRadius: '4px' }}>
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div style={{ color: 'green', marginBottom: '10px', fontSize: '0.9rem', backgroundColor: '#e5ffe5', padding: '10px', borderRadius: '4px' }}>
                    {successMessage}
                  </div>
                )}
                {existingImages.length > 0 && (
                  <div className={styles.existingImages}>
                    <p className={styles.label}>Поточні фотографії:</p>
                    <div className={styles.thumbnails}>
                      {existingImages.map((url, i) => (
                        <div key={i} className={styles.thumbWrapper}>
                          <img src={url} alt="" className={styles.thumb} />
                          <button type="button" onClick={() => handleRemoveExistingImage(i)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn" disabled={uploading}>
                    {uploading ? 'Зберігання...' : (editingProductId ? 'Зберегти зміни' : 'Опублікувати')}
                  </button>
                  {editingProductId && (
                    <button type="button" className="btn" style={{background: 'var(--border-color)', color: '#333'}} onClick={resetForm} disabled={uploading}>
                      Скасувати
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className={styles.listContainer}>
              <h2>Актуальні товари ({products.length})</h2>
              {loading ? <p>Завантаження...</p> : (
                <div className={styles.productList}>
                  {products.map(p => (
                    <div key={p.id} className={styles.productItem}>
                      <img src={p.image_url} alt="" className={styles.miniImg} />
                      <div className={styles.itemInfo}>
                        <h4>{p.name}</h4>
                        <span>{p.price} ₴ | {p.stock_quantity} шт</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" style={{padding: '5px 10px', fontSize: '0.8rem', flex: 1}} onClick={() => handleEditClick(p)}>✎ Редагувати</button>
                        <button className={styles.deleteBtn} style={{position: 'static', borderRadius: '4px', width: '30px', height: '30px'}} onClick={() => handleDelete(p.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className={styles.ordersContainer}>
            <h2>Усі замовлення</h2>
            <div className={styles.orderList}>
              {orders.length === 0 ? <p>Замовлень поки немає</p> : orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <h3>Замовлення #{order.id.slice(0, 8)}</h3>
                      <span className={styles.orderDate}>{new Date(order.created_at).toLocaleString('uk-UA')}</span>
                    </div>
                    <div className={styles.orderStatuses}>
                      <select 
                        value={order.order_status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="Нове">Нове</option>
                        <option value="Підтверджено">Підтверджено</option>
                        <option value="Відправлено">Відправлено</option>
                        <option value="Скасовано">Скасовано</option>
                      </select>
                      <select 
                        value={order.payment_status} 
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className={styles.paymentSelect}
                      >
                        <option value="Очікує">Очікує оплати</option>
                        <option value="Оплачено">Оплачено</option>
                        <option value="Повернення">Повернення</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.orderContent}>
                    <div className={styles.customerInfo}>
                      <p><strong>Клієнт:</strong> {order.customer_name}</p>
                      <p><strong>Телефон:</strong> {order.customer_phone}</p>
                      <p><strong>Доставка:</strong> {order.shipping_city}, {order.shipping_address}</p>
                    </div>
                    <div className={styles.orderItems}>
                      <h4>Товари:</h4>
                      {order.order_items.map(item => (
                        <div key={item.id} className={styles.orderItemRow}>
                          <span>{item.products?.name || 'Видалений товар'} x {item.quantity}</span>
                          <span>{item.price_at_purchase * item.quantity} ₴</span>
                        </div>
                      ))}
                      <div className={styles.orderTotal}>
                        <span>Загалом:</span>
                        <strong>{order.total_price} ₴</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
