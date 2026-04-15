import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import FreteCalculadora from './FreteCalculadora';

const API_MEDIA = import.meta.env.VITE_API_BASE?.replace('/api', '') ?? 'http://localhost:8000';

const emptyAddress = { address: '', number: '', city: '', state: '', cep: '' };

const CartSidebar = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
  onLoginRequest,
  onPaymentRequest,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [freteOpcao, setFreteOpcao] = useState(null);
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const [addressData, setAddressData] = useState(emptyAddress);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freteValor = freteOpcao ? Number(freteOpcao.preco) : 0;
  const total = subtotal + freteValor;

  const profileAddress = {
    address: user?.profile?.address ?? '',
    number: user?.profile?.number ?? '',
    city: user?.profile?.city ?? '',
    state: user?.profile?.state ?? '',
    cep: user?.profile?.cep ?? '',
  };

  const hasProfileAddress = !!(profileAddress.address || profileAddress.cep);

  // Reseta ao fechar
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setFreteOpcao(null);
      setUseProfileAddress(false);
      setAddressData(emptyAddress);
    }
  }, [isOpen]);

  // Quando checkbox muda
  const handleUseProfileAddress = (checked) => {
    setUseProfileAddress(checked);
    if (checked) {
      setAddressData(profileAddress);
    } else {
      setAddressData(emptyAddress);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (!user) {
      onLoginRequest();
      return;
    }

    if (!freteOpcao) {
      setError('Selecione uma opção de frete para continuar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const order = await api.post('/orders/', {
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: addressData.address,
        shipping_number: addressData.number,
        shipping_city: addressData.city,
        shipping_state: addressData.state,
        shipping_cep: addressData.cep,
        frete_valor: freteOpcao.preco,
        frete_transportadora: freteOpcao.transportadora,
        frete_servico: freteOpcao.servico,
        frete_prazo_dias: freteOpcao.prazo_com_producao,
      });

      onClose();
      onPaymentRequest(order.id, order.total ?? total);
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
          <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
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

          {/* Conteúdo rolável */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">

              {/* Itens do carrinho */}
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

              {/* Endereço + Frete — só quando logado e com itens */}
              {user && cartItems.length > 0 && (
                <>
                  {/* Endereço de entrega */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-sm font-semibold text-marrom-linho">
                      Endereço de entrega
                    </p>

                    {/* Checkbox usar endereço do perfil */}
                    {hasProfileAddress && (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useProfileAddress}
                          onChange={(e) => handleUseProfileAddress(e.target.checked)}
                          className="w-4 h-4 accent-terracota"
                        />
                        <span className="text-sm text-muted-foreground">
                          Usar endereço do meu perfil
                        </span>
                      </label>
                    )}

                    {/* Campos de endereço */}
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        name="address"
                        placeholder="Rua / Avenida"
                        value={addressData.address}
                        onChange={handleAddressChange}
                        disabled={useProfileAddress}
                        className="col-span-2 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-terracota disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        name="number"
                        placeholder="Nº"
                        value={addressData.number}
                        onChange={handleAddressChange}
                        disabled={useProfileAddress}
                        className="px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-terracota disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        name="city"
                        placeholder="Cidade"
                        value={addressData.city}
                        onChange={handleAddressChange}
                        disabled={useProfileAddress}
                        className="col-span-2 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-terracota disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="UF"
                        value={addressData.state}
                        onChange={handleAddressChange}
                        disabled={useProfileAddress}
                        maxLength={2}
                        className="px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-terracota uppercase disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Calculadora de frete */}
                  <div className="border-t border-border pt-4">
                    <FreteCalculadora
                      cartItems={cartItems}
                      cepInicial={addressData.cep}
                      onCepChange={(digits) => {
                        if (!useProfileAddress) {
                          setAddressData((prev) => ({ ...prev, cep: digits }));
                        }
                      }}
                      onSelect={(opcao) => {
                        setFreteOpcao(opcao);
                        if (error) setError('');
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer fixo */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-border space-y-3 flex-shrink-0">
              {/* Resumo de valores */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Frete</span>
                  <span>
                    {freteOpcao
                      ? `R$ ${freteValor.toFixed(2).replace('.', ',')}`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg pt-1 border-t border-border">
                  <span className="font-semibold text-marrom-linho">Total</span>
                  <span className="text-2xl font-bold text-terracota">
                    R$ {freteOpcao
                      ? total.toFixed(2).replace('.', ',')
                      : subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
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
                  disabled={loading || !freteOpcao}
                  className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
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
