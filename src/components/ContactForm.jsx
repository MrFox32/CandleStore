import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', contact_methods: ['Телефон'], message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Будь ласка, заповніть ім\'я та телефон');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const { error: dbError } = await supabase
      .from('contact_requests')
      .insert([
        { 
          name: formData.name, 
          phone: formData.phone, 
          contact_method: formData.contact_methods.join(', '),
          message: formData.message 
        }
      ]);

    setIsSubmitting(false);

    if (dbError) {
      setError('Сталася помилка при відправці. Спробуйте пізніше.');
      console.error(dbError);
      return;
    }

    setSubmitted(true);
    setFormData({ name: '', phone: '', contact_methods: ['Телефон'], message: '' });
  };

  return (
    <section id="contact" className={`section-padding ${styles.contactSection}`}>
      <div className={`container ${styles.container}`}>
        <div className={styles.info}>
          <h2 className={styles.title}>Замовлення</h2>
          <p className={styles.subtitle}>
            Залиште свої контакти і ми зв'яжемося з вами найближчим часом для підтвердження замовлення та деталей доставки.
          </p>
        </div>
        
        <div className={styles.formWrapper}>
          {submitted ? (
            <div className={styles.successMessage}>
              <h3>Дякуємо!</h3>
              <p>Ваша заявка прийнята. Ми скоро вам зателефонуємо.</p>
              <button className="btn" onClick={() => setSubmitted(false)} style={{marginTop: '20px'}}>Нова заявка</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}
              
              <div className={styles.formGroup}>
                <label htmlFor="name">Як до вас звертатися?</label>
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ваше ім'я"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="phone">Номер телефону / Username</label>
                <input 
                  type="text" 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+380... або @username"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Як краще з вами зв'язатись?</label>
                <div className={styles.checkboxGroup}>
                  {['Телефон', 'Email', 'Telegram', 'Viber', 'WhatsApp'].map(method => (
                    <label key={method} className={styles.checkboxLabel}>
                      <input 
                        type="checkbox"
                        checked={formData.contact_methods.includes(method)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (isChecked) {
                            setFormData({...formData, contact_methods: [...formData.contact_methods, method]});
                          } else {
                            setFormData({...formData, contact_methods: formData.contact_methods.filter(m => m !== method)});
                          }
                        }}
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">Коментар (необов'язково)</label>
                <textarea 
                  id="message" 
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Який набір вас зацікавив?"
                ></textarea>
              </div>
              
              <button type="submit" className={`btn ${styles.submitBtn}`} disabled={isSubmitting}>
                {isSubmitting ? 'Відправлення...' : 'Залишити заявку'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
