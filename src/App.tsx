import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ProductShowcase from './components/ProductShowcase';
import ReviewsSection from './components/ReviewsSection';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import SuccessPage from './pages/Checkout/SuccessPage';
import ProductPage from './pages/Product/ProductPage';
import { Session } from '@supabase/supabase-js';

function MainSite() {
  return (
    <>
      <Header />
      <CartDrawer />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProductShowcase />
        <ReviewsSection />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route 
            path="/admin" 
            element={session ? <AdminDashboard /> : <AdminLogin />} 
          />
          <Route path="/product/:id" element={
            <>
              <Header />
              <CartDrawer />
              <ProductPage />
              <Footer />
            </>
          } />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
