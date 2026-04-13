import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import { Button } from '@/components/ui/button';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar produtos da API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products/');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        cartItemsCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-rosa-cha to-creme-algodao py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-playfair font-bold text-marrom-linho mb-6">
            Dety Costureira & Artesanatos
          </h1>
          <p className="text-xl md:text-2xl text-verde-oliva mb-8 font-lato">
            Artesanato contemporâneo com alma e identidade
          </p>
          <p className="text-lg text-marrom-linho max-w-2xl mx-auto mb-8">
            Cada peça é única, feita à mão com dedicação e carinho. 
            Descubra a beleza do trabalho artesanal.
          </p>
          <Button
            onClick={() => document.getElementById('loja').scrollIntoView({ behavior: 'smooth' })}
            className="btn-terracota text-lg px-8 py-6"
          >
            Ver Produtos
          </Button>
        </div>
      </section>

      {/* Loja Section */}
      <section id="loja" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-playfair font-bold text-marrom-linho text-center mb-12">
            Nossa Loja
          </h2>

          {/* Filtros de Categoria */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Button
                onClick={() => setSelectedCategory(null)}
                variant={selectedCategory === null ? 'default' : 'outline'}
                className={selectedCategory === null ? 'btn-terracota' : ''}
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className={selectedCategory === category.id ? 'btn-terracota' : ''}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}

          {/* Grid de Produtos */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                Nenhum produto disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="py-16 bg-rosa-cha">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-playfair font-bold text-marrom-linho mb-6">
            Sobre Nós
          </h2>
          <p className="text-lg text-marrom-linho leading-relaxed mb-6">
            A <strong>Dety Costureira & Artesanatos</strong> nasceu do amor pelo trabalho manual 
            e pela valorização da arte artesanal. Cada peça é cuidadosamente confeccionada, 
            unindo técnicas tradicionais com um toque contemporâneo.
          </p>
          <p className="text-lg text-marrom-linho leading-relaxed">
            Acreditamos que o artesanato carrega história, personalidade e calor humano. 
            Por isso, cada produto é único e feito especialmente para você.
          </p>
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-playfair font-bold text-marrom-linho mb-6">
            Entre em Contato
          </h2>
          <p className="text-lg text-marrom-linho mb-8">
            Tem alguma dúvida ou pedido especial? Entre em contato conosco pelo WhatsApp!
          </p>
          <Button
            onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
            className="btn-terracota text-lg px-8 py-6 bg-green-600 hover:bg-green-700"
          >
            Falar no WhatsApp
          </Button>
        </div>
      </section>

      <Footer />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}

export default App;

