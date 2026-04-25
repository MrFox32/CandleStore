import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './Admin.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className={styles.adminContainer}>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <h1>Адмін-панель</h1>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Увійти...' : 'Увійти'}
        </button>
      </form>
    </div>
  );
}
