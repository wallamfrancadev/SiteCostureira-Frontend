import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { api } from '../services/api';

const ProductDetailPage = ({ onCartOpen }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToCart } = useCartContext();

  useEffect(() => {
    api.get(`/products/${id}/`)
      .then(setProduct)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    onCartOpen?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-muted-foreground">Carregando produto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl text-muted-foreground">Produto não encontrado.</p>
        <Button asChild variant="outline">
          <Link to="/">Voltar à loja</Link>
        </Button>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-marrom-linho hover:text-terracota transition-colors mb-8 font-lato"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar à loja
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Imagem */}
        <div className="aspect-square bg-rosa-cha rounded-2xl overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🧵</span>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex flex-col justify-center gap-6">
          {product.category_name && (
            <span className="text-sm font-lato text-verde-oliva uppercase tracking-wider">
              {product.category_name}
            </span>
          )}
          <h1 className="text-4xl font-playfair font-bold text-marrom-linho">
            {product.name}
          </h1>
          <p className="text-3xl font-lato font-semibold text-terracota">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </p>
          <p className="text-marrom-linho leading-relaxed font-lato">
            {product.description}
          </p>
          <p className={`text-sm font-lato ${inStock ? 'text-verde-oliva' : 'text-red-500'}`}>
            {inStock ? `${product.stock} em estoque` : 'Fora de estoque'}
          </p>
          <Button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="btn-terracota text-lg py-6 gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {inStock ? 'Adicionar ao carrinho' : 'Indisponível'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
