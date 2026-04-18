import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', telegram_username: '', contact_methods: ['Телефон'], message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Будь ласка, заповніть ім\'я');
      return;
    }
    if (formData.contact_methods.length === 0) {
      setError('Будь ласка, оберіть хоча б один канал зв\'язку');
      return;
    }
    if (formData.contact_methods.includes('Телефон') && !formData.phone) {
      setError('Будь ласка, введіть номер телефону');
      return;
    }

    if (formData.contact_methods.includes('Email') && !formData.email) {
      setError('Будь ласка, введіть Email');
      return;
    }
    if ((formData.contact_methods.includes('Telegram') || formData.contact_methods.includes('Viber') || formData.contact_methods.includes('WhatsApp')) && !formData.telegram_username && !formData.phone) {
      setError('Будь ласка, введіть номер телефону або Username для месенджера');
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
          email: formData.email,
          telegram_username: formData.telegram_username,
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
    setFormData({ name: '', phone: '', email: '', telegram_username: '', contact_methods: ['Телефон'], message: '' });
  };

  return (
    <section id="contact" className={`section-padding ${styles.contactSection}`}>
      <div className={`container ${styles.container}`}>
        <div className={styles.info}>
          <h2 className={styles.title}>Залишилися питання?</h2>
          <p className={styles.subtitle}>
            Напишіть нам, і ми допоможемо підібрати ідеальну свічку або обговоримо деталі вашого замовлення.
          </p>
        </div>

        <div className={styles.formWrapper}>
          {submitted ? (
            <div className={styles.successMessage}>
              <h3>Дякуємо!</h3>
              <p>Ваша заявка прийнята. Ми скоро з вами зв'яжемося.</p>
              <button className="btn" onClick={() => setSubmitted(false)} style={{ marginTop: '20px' }}>Нове питання</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}

              {/* Step 1: Name */}
              <div className={styles.formGroup}>
                <label htmlFor="name">Як до вас звертатися?</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ваше ім'я"
                  className={styles.mainInput}
                />
              </div>

              {/* Step 2: Contact Method Selection (CHIPS) */}
              <div className={styles.formGroup}>
                <label>Оберіть зручний канал зв'язку:</label>
                <div className={styles.chipGroup}>
                  {[
                    {
                      id: 'Телефон',
                      label: 'Телефон',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      )
                    },
                    {
                      id: 'Email',
                      label: 'Email',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                        </svg>
                      )
                    },
                    {
                      id: 'Telegram',
                      label: 'Telegram',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.665 3.717l-17.73 6.837c-1.213.486-1.203 1.163-.222 1.462l4.552 1.42 1.589 4.893c.189.525.094.734.656.734.437 0 .63-.199.874-.437l2.1-2.04 4.368 3.227c.804.443 1.381.214 1.581-.75l2.86-13.48c.294-1.177-.453-1.714-1.228-1.366z" />
                        </svg>
                      )
                    },
                    {
                      id: 'Viber',
                      label: 'Viber',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.84 8.7a8.42 8.42 0 0 0-3.64-5.22 1 1 0 1 0-1 1.74 6.4 6.4 0 0 1 2.76 4c.16.51.7.83 1.21.67a1 1 0 0 0 .67-1.19zM22 9c0-5.52-4.48-10-10-10a1 1 0 0 0 0 2c4.41 0 8 3.59 8 8a1 1 0 1 0 2 0z" />
                          <path d="M19.16 13.91l-1.42 1.41a2.84 2.84 0 0 1-3.61.34L11.5 13.8a9.42 9.42 0 0 1-2.58-2.31l-1.8-2.61a2.83 2.83 0 0 1 .34-3.61l1.41-1.42a1 1 0 0 0 0-1.42l-3.53-3.53a1 1 0 0 0-1.42 0L2.5 1.05a4.84 4.84 0 0 0 0 6.84l9.19 9.19a4.84 4.84 0 0 0 6.84 0l2.15-2.15a1 1 0 0 0 0-1.42l-3.53-3.53a1 1 0 0 0-1.42 0z" />
                        </svg>
                      )
                    },
                    {
                      id: 'WhatsApp',
                      label: 'WhatsApp',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      )
                    }
                  ].map(method => (

                    <button
                      key={method.id}
                      type="button"
                      className={`${styles.chip} ${formData.contact_methods.includes(method.id) ? styles.chipActive : ''}`}
                      onClick={() => {
                        const methods = formData.contact_methods;
                        if (methods.includes(method.id)) {
                          setFormData({ ...formData, contact_methods: methods.filter(m => m !== method.id) });
                        } else {
                          setFormData({ ...formData, contact_methods: [...methods, method.id] });
                        }
                      }}
                    >
                      <span className={styles.chipIcon}>{method.icon}</span>
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Dynamic Fields (Animated Reveal) */}
              <div className={styles.dynamicFields}>
                {(formData.contact_methods.includes('Телефон') ||
                  formData.contact_methods.includes('Viber') ||
                  formData.contact_methods.includes('WhatsApp') ||
                  formData.contact_methods.includes('Telegram')) && (
                    <div className={`${styles.formGroup} ${styles.revealField}`}>
                      <label htmlFor="phone">Номер телефону (для зв'язку або пошуку в месенджерах)</label>
                      <input
                        type="text"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+380..."
                      />
                    </div>
                  )}

                {formData.contact_methods.includes('Email') && (
                  <div className={`${styles.formGroup} ${styles.revealField}`}>
                    <label htmlFor="email">Електронна пошта</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@mail.com"
                    />
                  </div>
                )}

                {formData.contact_methods.includes('Telegram') && (
                  <div className={`${styles.formGroup} ${styles.revealField}`}>
                    <label htmlFor="telegram_username">Telegram @username (якщо прихований номер)</label>
                    <input
                      type="text"
                      id="telegram_username"
                      value={formData.telegram_username}
                      onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                )}
              </div>

              {/* Step 4: Comment */}
              <div className={styles.formGroup}>
                <label htmlFor="message">Бажаєте щось додати? (необов'язково)</label>
                <textarea
                  id="message"
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Наприклад: колір свічки, час доставки або ваше запитання..."
                ></textarea>
              </div>

              <button type="submit" className={`btn ${styles.submitBtn}`} disabled={isSubmitting}>
                {isSubmitting ? 'Відправлення...' : 'Надіслати запитання'}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
