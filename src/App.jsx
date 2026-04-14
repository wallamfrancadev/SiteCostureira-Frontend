import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import { useCartContext } from './context/CartContext';
import './App.css';

function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { cartItems, updateQuantity, removeItem, totalItems, clearCart } = useCartContext();

  const handleLoginRequest = () => {
    setIsCartOpen(false);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        cartItemsCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
        onAuthOpen={() => setIsAuthOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onCartOpen={() => setIsCartOpen(true)} />} />
          <Route path="/produto/:id" element={<ProductDetailPage onCartOpen={() => setIsCartOpen(true)} />} />
          <Route path="/meus-pedidos" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/painel" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
      </main>

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onOrderSuccess={clearCart}
        onLoginRequest={handleLoginRequest}
      />

      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
