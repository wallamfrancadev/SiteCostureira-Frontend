import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const ProductCard = ({ product, onAddToCart }) => {
  const imageUrl = product.image || null;

  return (
    <Card className="card-hover overflow-hidden bg-card border-border">
      <div className="relative h-64 overflow-hidden bg-rosa-cha">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🧵</div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Esgotado</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-playfair text-xl font-semibold text-marrom-linho mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-terracota">
            R$ {parseFloat(product.price).toFixed(2)}
          </span>
          {product.stock > 0 && (
            <span className="text-xs text-verde-oliva">
              {product.stock} em estoque
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product)}
          disabled={product.stock <= 0}
          className="w-full btn-terracota"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

