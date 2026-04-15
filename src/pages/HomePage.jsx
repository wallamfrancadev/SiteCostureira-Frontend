import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from '../components/ProductCard';
import { useCartContext } from '../context/CartContext';
import { api } from '../services/api';

const HomePage = ({ onCartOpen }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartContext();

  useEffect(() => {
    api.get('/products/')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get('/categories/')
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    onCartOpen?.();
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <>
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
            Onde seu desejo se torna arte. Todas as peças são feitas à mão,
            com muita dedicação e carinho.
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-playfair font-bold text-marrom-linho text-center mb-10">
            Sobre Nós
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Foto */}
            <div className="flex-shrink-0">
              <img
                src="/sobre-dety.jpg"
                alt="Dety Artesanatos"
                className="w-64 h-80 object-cover rounded-2xl shadow-lg"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            {/* Texto */}
            <div className="space-y-4 text-marrom-linho text-lg leading-relaxed">
              <p>
                Sempre fomos uma família do mundo do artesanato, e desde pequena eu amo fazer arte.
              </p>
              <p>
                Há 10 anos venho trabalhando com corte e costura, e realizamos desde trabalho industrial ao cotidiano.
              </p>
              <p>
                Tento transmitir esse amor e carinho em cada trabalho que faço!
                Espero que goste do nosso trabalho e caso tenha algum pedido exclusivo, nos contate pelo WhatsApp!
              </p>
              <p className="font-playfair font-semibold text-xl pt-2 text-center">Dety.</p>
            </div>
          </div>
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
            onClick={() => {
              const msg = encodeURIComponent(
                'Olá, Vi seu trabalho através do site DetyArtesanatos.com.br e gostaria de realizar uma encomenda!!'
              );
              window.open(`https://wa.me/5511982841563?text=${msg}`, '_blank');
            }}
            className="btn-terracota text-lg px-8 py-6 bg-green-600 hover:bg-green-700"
          >
            Falar no WhatsApp
          </Button>
        </div>
      </section>
    </>
  );
};

export default HomePage;
