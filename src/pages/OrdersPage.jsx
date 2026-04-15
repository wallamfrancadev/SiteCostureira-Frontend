import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, XCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '../services/api';
import PagamentoModal from '../components/PagamentoModal';

const STATUS_LABELS = {
  pending:    { label: 'Pendente',      color: 'text-yellow-600 bg-yellow-50' },
  processing: { label: 'Processando',   color: 'text-blue-600 bg-blue-50' },
  shipped:    { label: 'Enviado',       color: 'text-purple-600 bg-purple-50' },
  delivered:  { label: 'Entregue',      color: 'text-green-600 bg-green-50' },
  cancelled:  { label: 'Cancelado',     color: 'text-red-600 bg-red-50' },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState('5511999999999');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [pagamentoOrder, setPagamentoOrder] = useState(null);

  const loadOrders = () => {
    api.get('/orders/')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    api.get('/info/')
      .then((data) => {
        const info = data?.results?.[0] ?? data?.[0];
        if (info?.whatsapp) setWhatsapp(info.whatsapp);
      })
      .catch(() => {});
  }, []);

  const buildWhatsAppMessage = (order) => {
    let msg = `🛍️ *Olá! Quero confirmar o pagamento do pedido #${order.id}:*\n\n`;
    order.items.forEach((item, i) => {
      msg += `${i + 1}. *${item.product_name}*\n`;
      msg += `   Qtd: ${item.quantity} — Subtotal: R$ ${Number(item.subtotal).toFixed(2).replace('.', ',')}\n\n`;
    });
    msg += `💰 *Total: R$ ${Number(order.total).toFixed(2).replace('.', ',')}*\n\n`;
    msg += 'Aguardo confirmação do pagamento! 😊';
    return msg;
  };

  const handlePayWhatsApp = (order) => {
    const msg = buildWhatsAppMessage(order);
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePaid = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'processing' } : o))
    );
    setPagamentoOrder(null);
  }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const updated = await api.patch(`/orders/${cancelTarget.id}/cancel/`, {});
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch {
      // silencioso
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-muted-foreground">Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-playfair font-bold text-marrom-linho mb-8">
        Meus Pedidos
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: '' };
            const isPending = order.status === 'pending';

            return (
              <div
                key={order.id}
                className="border border-border rounded-xl p-6 bg-card shadow-sm"
              >
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <p className="font-playfair text-lg font-semibold text-marrom-linho">
                      Pedido #{order.id}
                    </p>
                    <p className="text-sm text-muted-foreground font-lato">
                      {new Date(order.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-rosa-cha rounded-lg flex items-center justify-center text-xl">
                            🧵
                          </div>
                        )}
                        <div>
                          <p className="font-lato font-medium text-marrom-linho">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-lato font-semibold text-terracota">
                        R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-border gap-3">
                  <p className="font-playfair text-xl font-bold text-marrom-linho">
                    Total: R$ {Number(order.total).toFixed(2).replace('.', ',')}
                  </p>

                  {isPending && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setPagamentoOrder(order)}
                        className="bg-terracota hover:bg-terracota/90 text-white gap-2"
                        size="sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pagar
                      </Button>
                      <Button
                        onClick={() => handlePayWhatsApp(order)}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                      <Button
                        onClick={() => setCancelTarget(order)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-500 hover:bg-red-50 gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PagamentoModal
        orderId={pagamentoOrder?.id ?? null}
        orderTotal={Number(pagamentoOrder?.total ?? 0)}
        onClose={() => setPagamentoOrder(null)}
        onPaid={handlePaid}
      />

      <AlertDialog open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar pedido #{cancelTarget?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido será cancelado e os produtos serão devolvidos ao estoque.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? 'Cancelando...' : 'Sim, cancelar pedido'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPage;
