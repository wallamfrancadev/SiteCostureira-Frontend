import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, MessageCircle, ShoppingBag, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const API_MEDIA = import.meta.env.VITE_API_BASE?.replace('/api', '') ?? 'http://localhost:8000';

const CartSidebar = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
  onLoginRequest,
}) => {
  const { user } = useAuth();
  const [whatsapp, setWhatsapp] = useState('5511999999999');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Busca o número de WhatsApp do SiteInfo
  useEffect(() => {
    api.get('/info/')
      .then((data) => {
        if (data?.results?.[0]?.whatsapp) setWhatsapp(data.results[0].whatsapp);
        else if (data?.[0]?.whatsapp) setWhatsapp(data[0].whatsapp);
      })
      .catch(() => {});
  }, []);

  // Quando abre o sidebar, limpa estados anteriores
  useEffect(() => {
    if (isOpen) {
      setError('');
      setOrderId(null);
    }
  }, [isOpen]);

  const buildWhatsAppMessage = (id) => {
    let msg = `🛍️ *Olá! Quero confirmar meu pedido #${id}:*\n\n`;
    cartItems.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}*\n`;
      msg += `   Qtd: ${item.quantity} × R$ ${Number(item.price).toFixed(2).replace('.', ',')}\n`;
      msg += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n\n`;
    });
    msg += `💰 *Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    msg += 'Aguardo confirmação do pagamento! 😊';
    return msg;
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // Se não estiver logado, abre modal de login
    if (!user) {
      onLoginRequest();
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Cria o pedido na API
      const order = await api.post('/orders/', {
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });

      setOrderId(order.id);

      // 2. Abre WhatsApp com o resumo do pedido
      const msg = buildWhatsAppMessage(order.id);
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');

      // 3. Limpa o carrinho
      onOrderSuccess();

    } catch (err) {
      const msgs = Object.values(err).flat().join(' ');
      setError(msgs || 'Erro ao registrar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = (item) => {
    if (!item.image) return null;
    if (item.image.startsWith('http')) return item.image;
    return `${API_MEDIA}${item.image}`;
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

          {/* Pedido confirmado */}
          {orderId && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-green-700 font-semibold">Pedido #{orderId} registrado!</p>
              <p className="text-green-600 text-sm mt-1">
                O WhatsApp foi aberto. Conclua o pagamento por lá.
              </p>
            </div>
          )}

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-background rounded-lg border border-border"
                  >
                    {imageUrl(item) ? (
                      <img
                        src={imageUrl(item)}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-rosa-cha rounded flex items-center justify-center text-2xl flex-shrink-0">
                        🧵
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-marrom-linho mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-terracota font-bold mb-2">
                        R$ {Number(item.price).toFixed(2).replace('.', ',')}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-rosa-cha hover:bg-terracota hover:text-white rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
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
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {!user ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Faça login para finalizar o pedido
                  </p>
                  <Button
                    onClick={onLoginRequest}
                    className="w-full btn-terracota text-lg py-6"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar para finalizar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {loading ? 'Registrando pedido...' : 'Finalizar pedido'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
