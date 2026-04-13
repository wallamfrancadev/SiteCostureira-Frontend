import { X, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const CartSidebar = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    let message = '🛍️ *Olá! Gostaria de fazer um pedido:*\n\n';
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço unitário: R$ ${parseFloat(item.price).toFixed(2)}\n`;
      message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += `💰 *Total: R$ ${total.toFixed(2)}*\n\n`;
    message += 'Aguardo confirmação! 😊';

    // Número do WhatsApp (substitua pelo número real)
    const phoneNumber = '5511999999999'; // Formato: código do país + DDD + número
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-card shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-playfair font-bold text-marrom-linho">
              Meu Carrinho
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-rosa-cha rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-marrom-linho" />
            </button>
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-background rounded-lg border border-border"
                  >
                    <img
                      src={item.image ? `http://localhost:8000${item.image}` : 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-marrom-linho mb-1">
                        {item.name}
                      </h3>
                      <p className="text-terracota font-bold mb-2">
                        R$ {parseFloat(item.price).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-rosa-cha hover:bg-terracota hover:text-white rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-rosa-cha hover:bg-terracota hover:text-white rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-auto p-1 text-destructive hover:bg-destructive hover:text-white rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-marrom-linho">Total:</span>
                <span className="text-2xl font-bold text-terracota">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleWhatsAppCheckout}
                className="w-full btn-terracota text-lg py-6 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Finalizar via WhatsApp
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;

