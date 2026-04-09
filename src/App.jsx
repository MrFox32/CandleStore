import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProductShowcase from './components/ProductShowcase';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

function App() {
  return (
    <CartProvider>
      <Header />
      <CartDrawer />
      <main>
        <HeroSection />
        <ProductShowcase />
        <ContactForm />
      </main>
      <Footer />
    </CartProvider>
  );
}

export default App;
