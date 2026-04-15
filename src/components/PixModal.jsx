import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, X, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { api } from '../services/api';

const POLL_INTERVAL_MS = 5000;

/**
 * Modal de pagamento PIX.
 *
 * Props:
 *  - orderId: number | null   → null fecha o modal
 *  - onClose: () => void
 *  - onPaid: (orderId) => void → chamado quando pagamento confirmado
 */
const PixModal = ({ orderId, onClose, onPaid }) => {
  const [pix, setPix] = useState(null);         // dados da cobrança
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paid, setPaid] = useState(false);

  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  const isOpen = !!orderId;

  // Cria a cobrança PIX ao abrir o modal
  const createCharge = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    setPix(null);
    setPaid(false);

    try {
      const data = await api.post('/pix/', { order_id: orderId });
      setPix(data);
      setSecondsLeft(data.expiracao_segundos);
    } catch (err) {
      const msg = Object.values(err ?? {}).flat().join(' ');
      setError(msg || 'Erro ao gerar cobrança PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen) {
      createCharge();
    } else {
      // Limpa ao fechar
      clearInterval(pollRef.current);
      clearInterval(countdownRef.current);
      setPix(null);
      setError('');
      setPaid(false);
      setSecondsLeft(0);
    }
  }, [isOpen, createCharge]);

  // Countdown
  useEffect(() => {
    if (!pix || paid) return;
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [pix, paid]);

  // Polling de status
  useEffect(() => {
    if (!pix || paid) return;
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get(`/pix/${pix.txid}/`);
        if (data.status === 'paid') {
          clearInterval(pollRef.current);
          clearInterval(countdownRef.current);
          setPaid(true);
          onPaid?.(orderId);
        }
      } catch {
        // silencioso — tenta de novo no próximo tick
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [pix, paid, orderId, onPaid]);

  const handleCopy = async () => {
    if (!pix?.qr_code_payload) return;
    try {
      await navigator.clipboard.writeText(pix.qr_code_payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback silencioso
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const expired = secondsLeft === 0 && pix && !paid;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-marrom-linho flex items-center gap-2">
            <QrCode className="w-5 h-5 text-terracota" />
            Pagar com PIX
          </DialogTitle>
          <DialogDescription>
            Pedido #{orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">

          {/* Carregando */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <RefreshCw className="w-8 h-8 text-terracota animate-spin" />
              <p className="text-muted-foreground text-sm">Gerando QR code PIX...</p>
            </div>
          )}

          {/* Erro */}
          {!loading && error && (
            <div className="w-full text-center space-y-3">
              <p className="text-red-500 text-sm">{error}</p>
              <Button onClick={createCharge} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Pago */}
          {paid && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-9 h-9 text-green-600" />
              </div>
              <p className="text-xl font-playfair font-bold text-green-700">Pagamento confirmado!</p>
              <p className="text-sm text-muted-foreground">
                Seu pedido foi atualizado para <strong>Processando</strong>.
              </p>
              <Button onClick={onClose} className="btn-terracota mt-2">Fechar</Button>
            </div>
          )}

          {/* QR Code */}
          {!loading && !error && pix && !paid && (
            <>
              {/* Countdown */}
              <div className={`text-sm font-mono font-semibold ${expired ? 'text-red-500' : 'text-terracota'}`}>
                {expired ? 'PIX expirado' : `Expira em ${formatTime(secondsLeft)}`}
              </div>

              {expired ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    O QR code expirou. Gere um novo para continuar.
                  </p>
                  <Button onClick={createCharge} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar novo PIX
                  </Button>
                </div>
              ) : (
                <>
                  {/* Imagem do QR */}
                  <div className="border border-border rounded-xl p-3 bg-white">
                    <img
                      src={`data:image/png;base64,${pix.qr_code_image_b64}`}
                      alt="QR Code PIX"
                      className="w-52 h-52 sm:w-60 sm:h-60 object-contain"
                    />
                  </div>

                  {/* Valor */}
                  <p className="text-2xl font-bold font-playfair text-marrom-linho">
                    R$ {Number(pix.valor).toFixed(2).replace('.', ',')}
                  </p>

                  {/* Pix Copia e Cola */}
                  <div className="w-full space-y-1">
                    <p className="text-xs text-muted-foreground text-center">Pix Copia e Cola</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={pix.qr_code_payload}
                        className="flex-1 text-xs bg-muted px-3 py-2 rounded-lg border border-border font-mono truncate"
                      />
                      <Button
                        onClick={handleCopy}
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                      >
                        {copied
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <Copy className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Abra o app do seu banco, escolha PIX e escaneie o QR code ou cole o código.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixModal;
