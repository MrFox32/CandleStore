import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './Admin.module.css';
import { Session } from '@supabase/supabase-js';
import { Product, Order, ContactRequest } from '../../types';
import { NovaPoshtaSelects } from '../../components/NovaPoshtaSelects';
import { novaPoshtaService } from '../../services/novaPoshta';

interface ProductFormData {
  name: string;
  description: string;
  price: string | number;
  stock_quantity: string | number;
  category: string;
  weight_grams: string | number;
  length_cm: string | number;
  width_cm: string | number;
  height_cm: string | number;
  is_active: boolean;
}

interface OrderItemInput {
  productId: string;
  qty: number;
}

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'requests'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Modal State for Request -> Order conversion
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<ContactRequest | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([{ productId: '', qty: 1 }]);
  const [orderCity, setOrderCity] = useState('');
  const [orderWarehouse, setOrderWarehouse] = useState('');
  const [orderNpCityRef, setOrderNpCityRef] = useState('');
  const [orderNpWarehouseRef, setOrderNpWarehouseRef] = useState('');
  const [orderProcessLoading, setOrderProcessLoading] = useState(false);
  const [adminError, setAdminError] = useState<{orderId: string, message: string} | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [copiedTtn, setCopiedTtn] = useState<string | null>(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [formData.description]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProducts();
        fetchOrders();
        fetchRequests();
      }
    });
  }, []);

  async function fetchRequests() {
    const { data, error } = await supabase.from('contact_requests').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setRequests(data || []);
  }

  async function updateRequestStatus(requestId: string, status: string) {
    const { error } = await supabase.from('contact_requests').update({ status }).eq('id', requestId);
    if (error) alert(error.message);
    else fetchRequests();
  }

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

  async function updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    if (error) alert(error.message);
    else fetchOrders();
  }

  async function handleCreateWaybill(order: Order) {
    if (!order.np_city_ref || !order.np_warehouse_ref) {
      alert("Відсутні дані для створення ТТН (місто або відділення)");
      return;
    }

    setProcessingOrderId(order.id);
    setLoading(true);
    try {
      const res = await novaPoshtaService.createDocument({
        recipientName: order.customer_name,
        recipientPhone: order.customer_phone,
        cityRecipient: order.np_city_ref,
        warehouseRecipient: order.np_warehouse_ref,
        cost: order.total_price,
        weight: (order.order_items?.reduce((sum, item) => sum + (300 * item.quantity), 0) ?? 500) / 1000
      });

      if (res.success && res.data && res.data[0]) {
        const doc = res.data[0];
        const { error } = await supabase.from('orders').update({
          np_tracking_number: doc.IntDocNumber,
          np_document_ref: doc.Ref,
          order_status: 'Підтверджено'
        }).eq('id', order.id);

        if (error) throw error;
        setSuccessMessage(`ТТН #${doc.IntDocNumber} успішно створено!`);
        setAdminError(null);
        fetchOrders();
      } else {
        const errMsg = res.errors?.join(', ') || "Помилка API Нової Пошти";
        setAdminError({ orderId: order.id, message: errMsg });
      }
    } catch (err: any) {
      setAdminError({ orderId: order.id, message: err.message });
    } finally {
      setProcessingOrderId(null);
      setLoading(false);
    }
    setTimeout(() => setSuccessMessage(''), 5000);
  }

  const handleCopyTTN = (ttn: string) => {
    navigator.clipboard.writeText(ttn);
    setCopiedTtn(ttn);
    setTimeout(() => setCopiedTtn(null), 2000);
  };

  async function updatePaymentStatus(orderId: string, status: string) {
    const { error } = await supabase.from('orders').update({ payment_status: status }).eq('id', orderId);
    if (error) alert(error.message);
    else fetchOrders();
  }

  async function handleSubmitProduct(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    let uploadedUrls = [...existingImages];

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
          setErrorMessage(`Помилка Storage (фото ${file.name}): ` + uploadError.message);
          setUploading(false);
          return;
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
      price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
      stock_quantity: typeof formData.stock_quantity === 'string' ? parseInt(formData.stock_quantity) : formData.stock_quantity,
      weight_grams: typeof formData.weight_grams === 'string' ? parseFloat(formData.weight_grams) : formData.weight_grams,
      length_cm: typeof formData.length_cm === 'string' ? parseFloat(formData.length_cm) : formData.length_cm,
      width_cm: typeof formData.width_cm === 'string' ? parseFloat(formData.width_cm) : formData.width_cm,
      height_cm: typeof formData.height_cm === 'string' ? parseFloat(formData.height_cm) : formData.height_cm,
    };

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
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setUploading(false);
  }

  function openCreateOrderModal(request: ContactRequest) {
    setCurrentRequest(request);
    setOrderCity('');
    setOrderWarehouse('');
    setOrderNpCityRef('');
    setOrderNpWarehouseRef('');
    setOrderItems([{ productId: '', qty: 1 }]);
    setIsOrderModalOpen(true);
  }

  async function handleProcessOrderFromRequest() {
    if (!currentRequest) return;
    if (!orderCity || !orderWarehouse || orderItems.some(item => !item.productId || item.qty < 1)) {
      alert("Заповніть всі поля: оберіть місто, відділення та оберіть хоча б один товар");
      return;
    }

    setOrderProcessLoading(true);

    let totalPrice = 0;
    const finalOrderItems: any[] = [];
    
    orderItems.forEach(item => {
      const product = products.find(p => p.id.toString() === item.productId.toString());
      if (product) {
        totalPrice += product.price * item.qty;
        finalOrderItems.push({
          product_id: product.id,
          quantity: item.qty,
          price_at_purchase: product.price
        });
      }
    });

    const { data: order, error: orderError } = await (supabase
      .from('orders')
      .insert([{
        customer_name: currentRequest.name,
        customer_phone: currentRequest.phone,
        customer_email: currentRequest.email || '',
        shipping_city: orderCity,
        shipping_address: orderWarehouse,
        np_city_ref: orderNpCityRef || null,
        np_warehouse_ref: orderNpWarehouseRef || null,
        total_price: totalPrice,
        order_status: 'Нове'
      }])
      .select()
      .single() as any);

    if (orderError) {
      alert("Помилка створення замовлення: " + orderError.message);
      setOrderProcessLoading(false);
      return;
    }

    const dbOrderItems = finalOrderItems.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(dbOrderItems);
    
    if (itemsError) {
      alert("Помилка додавання товарів до замовлення: " + itemsError.message);
      setOrderProcessLoading(false);
      return;
    }

    await supabase.from('contact_requests').update({ 
      status: 'Створено замовлення',
      order_id: order.id
    }).eq('id', currentRequest.id);
    
    setIsOrderModalOpen(false);
    setOrderProcessLoading(false);
    fetchRequests();
    fetchOrders();
    setActiveTab('orders');
  }

  function resetForm() {
    setFormData({ name: '', description: '', price: '', stock_quantity: '', category: '', weight_grams: '', length_cm: '', width_cm: '', height_cm: '', is_active: true });
    setImageFiles([]);
    setFileInputKey(Date.now());
    setExistingImages([]);
    setEditingProductId(null);
  }

  function handleEditClick(product: Product) {
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
    setExistingImages(product.images || [product.image_url].filter(Boolean) as string[]);
    setEditingProductId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRemoveExistingImage(index: number) {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  }

  async function handleDelete(id: string | number) {
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
                <button 
                  className={activeTab === 'requests' ? styles.activeTab : ''} 
                  onClick={() => setActiveTab('requests')}
                >
                  Запити ({requests.filter(r => r.status === 'Новий').length})
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
            <section className={styles.formContainer}>
              <h2>{editingProductId ? 'Редагувати товар' : 'Додати новий товар'}</h2>
              <form onSubmit={handleSubmitProduct} className={styles.addForm}>
                <input type="text" placeholder="Назва товару" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <textarea 
                  ref={descriptionRef}
                  placeholder="Опис" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  required 
                />
                <div className={styles.row}>
                  <input type="text" placeholder="Ціна (₴)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  <input type="text" placeholder="Кількість (шт)" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} required />
                </div>
                <div className={styles.row}>
                  <input type="text" placeholder="Категорія" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                  <input type="text" placeholder="Вага (г)" value={formData.weight_grams} onChange={e => setFormData({...formData, weight_grams: e.target.value})} required />
                </div>
                <p className={styles.label}>Габарити пакування (см):</p>
                <div className={styles.row}>
                  <input type="text" placeholder="Д" value={formData.length_cm} onChange={e => setFormData({...formData, length_cm: e.target.value})} required />
                  <input type="text" placeholder="Ш" value={formData.width_cm} onChange={e => setFormData({...formData, width_cm: e.target.value})} required />
                  <input type="text" placeholder="В" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} required />
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
        ) : activeTab === 'requests' ? (
          <div className={styles.ordersContainer}>
            <h2>Всі запити на зворотній зв'язок</h2>
            {loading ? <p>Завантаження запитів...</p> : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Клієнт</th>
                      <th>Контакт</th>
                      <th>Канал</th>
                      <th>Повідомлення</th>
                      <th>Статус</th>
                      <th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id}>
                        <td>{new Date(r.created_at).toLocaleString('uk-UA')}</td>
                        <td>{r.name}</td>
                        <td>
                          {r.phone && <div>📞 {r.phone}</div>}
                          {r.email && <div>📧 {r.email}</div>}
                          {r.telegram_username && <div>💬 {r.telegram_username}</div>}
                        </td>
                        <td>{r.contact_method}</td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.message}</td>
                        <td>
                          {r.status === 'Створено замовлення' && r.order_id ? (
                            <span className={styles.orderIdBadge}>#{r.order_id.slice(0, 8)}</span>
                          ) : (
                            <select 
                              value={r.status} 
                              onChange={(e) => updateRequestStatus(r.id, e.target.value)}
                              disabled={r.status === 'Створено замовлення'}
                            >
                              <option value="Новий">Новий</option>
                              <option value="В обробці">В обробці</option>
                              <option value="Опрацьовано">Опрацьовано</option>
                              <option value="Створено замовлення" disabled>Створено замовлення</option>
                              <option value="Скасовано">Скасовано</option>
                            </select>
                          )}
                        </td>
                        <td>
                          {r.status !== 'Створено замовлення' && (
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              onClick={() => openCreateOrderModal(r)}
                            >
                              + Замовлення
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan={7} style={{textAlign: 'center'}}>Немає запитів</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
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
                      <p><strong>Доставка:</strong> {order.shipping_city}{order.shipping_city && order.shipping_address ? ', ' : ''}{order.shipping_address}</p>
                      
                      {adminError?.orderId === order.id && (
                        <div className={styles.adminErrorInline}>
                          ⚠️ {adminError.message}
                        </div>
                      )}

                      {order.np_tracking_number && (
                        <div className={styles.ttnContainer}>
                          <div className={styles.ttnWrapper}>
                            <div className={styles.ttnDisplay}>
                              <span className={styles.ttnLabel}>ТТН</span>
                              <span className={styles.ttnNumber}>{order.np_tracking_number}</span>
                              <button 
                                className={`${styles.copyBtn} ${copiedTtn === order.np_tracking_number ? styles.copied : ''}`}
                                onClick={() => handleCopyTTN(order.np_tracking_number!)}
                                title="Копіювати ТТН"
                              >
                                {copiedTtn === order.np_tracking_number ? (
                                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                )}
                              </button>
                            </div>
                            
                            <div className={styles.printButtons}>
                              <a href={`https://my.novaposhta.ua/orders/printMarking100x100/orders[]/${order.np_tracking_number}/type/pdf/apiKey/2f1930d910d4dee82c07c48763d3f7c6`} target="_blank" rel="noreferrer" className={styles.printButton}>
                                <span>🖨️</span> Маркування
                              </a>
                              <a href={`https://my.novaposhta.ua/orders/printDocument/orders[]/${order.np_document_ref}/type/pdf/apiKey/2f1930d910d4dee82c07c48763d3f7c6`} target="_blank" rel="noreferrer" className={styles.printButton}>
                                <span>📄</span> Накладна
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                      {order.order_status === 'Нове' && order.np_city_ref && !order.np_tracking_number && (
                        <button 
                          className={`btn ${styles.createTtnBtn} ${processingOrderId === order.id ? styles.loading : ''}`} 
                          onClick={() => handleCreateWaybill(order)}
                          disabled={loading || processingOrderId === order.id}
                        >
                          {processingOrderId === order.id ? (
                            <>
                              <span className={styles.spinner}></span>
                              Створюємо...
                            </>
                          ) : (
                            <>📦 Сформувати ТТН</>
                          )}
                        </button>
                      )}
                    </div>
                    <div className={styles.orderItems}>
                      <h4>Товари:</h4>
                      {order.order_items?.map(item => (
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

      {/* CREATE ORDER MODAL */}
      {isOrderModalOpen && currentRequest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Створення замовлення із заявки</h2>
            <div style={{ marginBottom: '15px' }}>
              <strong>Клієнт:</strong> {currentRequest.name} <br/>
              <strong>Контакт:</strong> 
              {currentRequest.phone && <span style={{marginLeft: '5px'}}>📞 {currentRequest.phone}</span>}
              {currentRequest.email && <span style={{marginLeft: '5px'}}>📧 {currentRequest.email}</span>}
              {currentRequest.telegram_username && <span style={{marginLeft: '5px'}}>💬 {currentRequest.telegram_username}</span>}
              <br/>
              <small>Канал: {currentRequest.contact_method}</small>
            </div>
            
            <div className={styles.formGroup}>
              <label>Доставка (Нова Пошта):</label>
              <NovaPoshtaSelects 
                onCityChange={(city) => {
                  setOrderCity(city?.Description || '');
                  setOrderNpCityRef(city?.Ref || '');
                }}
                onWarehouseChange={(warehouse) => {
                  setOrderWarehouse(warehouse?.Description || '');
                  setOrderNpWarehouseRef(warehouse?.Ref || '');
                }}
              />
            </div>

            <div style={{ marginTop: '20px', marginBottom: '10px' }}>
              <strong>Товари:</strong>
            </div>
            {orderItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select 
                  value={item.productId} 
                  onChange={e => {
                    const newItems = [...orderItems];
                    newItems[index].productId = e.target.value;
                    setOrderItems(newItems);
                  }}
                  className={styles.modalSelect}
                  style={{ flex: 1 }}
                >
                  <option value="">Оберіть товар...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price} ₴)</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  min="1" 
                  value={item.qty} 
                  onChange={e => {
                    const newItems = [...orderItems];
                    newItems[index].qty = parseInt(e.target.value);
                    setOrderItems(newItems);
                  }} 
                  className={styles.modalInput}
                  style={{ width: '80px' }}
                />
                <button type="button" onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))} className="btn btn-outline" style={{ padding: '0 10px' }}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => setOrderItems([...orderItems, { productId: '', qty: 1 }])} className="btn btn-outline" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>+ Додати товар</button>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button disabled={orderProcessLoading} className="btn btn-outline" onClick={() => setIsOrderModalOpen(false)}>Скасувати</button>
              <button 
                className="btn" 
                onClick={handleProcessOrderFromRequest}
                disabled={orderProcessLoading}
              >
                {orderProcessLoading ? 'Створення...' : 'Створити замовлення'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
