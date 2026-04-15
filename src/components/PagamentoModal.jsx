import { useState, useEffect, useRef, useCallback } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { Copy, Check, QrCode, CreditCard, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '../services/api';

const extractError = (err) => {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err.detail) return err.detail;
  return Object.values(err).flat().filter(Boolean).join(' ');
};

const MP_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
const MP_KEY_VALID = MP_KEY && MP_KEY.startsWith('APP_USR-') || MP_KEY?.startsWith('TEST-') && MP_KEY.length > 20 && !MP_KEY.includes('seu_');
if (MP_KEY_VALID) initMercadoPago(MP_KEY, { locale: 'pt-BR' });

const POLL_MS = 5000;

const STATUS_FINAL = new Set(['approved', 'rejected', 'cancelled', 'refunded', 'in_mediation']);

const STATUS_DETAIL_LABELS = {
  cc_rejected_bad_filled_card_number: 'Número do cartão inválido.',
  cc_rejected_bad_filled_date: 'Data de expiração inválida.',
  cc_rejected_bad_filled_other: 'Dados do cartão incorretos.',
  cc_rejected_bad_filled_security_code: 'CVV inválido.',
  cc_rejected_blacklist: 'Cartão bloqueado.',
  cc_rejected_call_for_authorize: 'Ligue para seu banco para autorizar.',
  cc_rejected_card_disabled: 'Cartão desativado. Contate seu banco.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado detectado.',
  cc_rejected_high_risk: 'Pagamento recusado por segurança.',
  cc_rejected_insufficient_amount: 'Saldo insuficiente.',
  cc_rejected_invalid_installments: 'Número de parcelas inválido.',
  cc_rejected_max_attempts: 'Limite de tentativas atingido.',
  pending_contingency: 'Em processamento. Aguarde.',
  pending_review_manual: 'Em análise. Você receberá e-mail com o resultado.',
};

const PixForm = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, firstName, lastName, cpf });
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-terracota/50';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pix-nome" className="text-xs text-muted-foreground mb-1 block">Nome</label>
          <input id="pix-nome" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pix-sobrenome" className="text-xs text-muted-foreground mb-1 block">Sobrenome</label>
          <input id="pix-sobrenome" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="pix-email" className="text-xs text-muted-foreground mb-1 block">E-mail</label>
        <input id="pix-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="pix-cpf" className="text-xs text-muted-foreground mb-1 block">CPF</label>
        <input
          id="pix-cpf"
          required
          value={cpf}
          onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="00000000000"
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading} className="btn-terracota mt-1">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <QrCode className="w-4 h-4 mr-2" />}
        {loading ? 'Gerando...' : 'Gerar QR Code PIX'}
      </Button>
    </form>
  );
};

const QrCodeView = ({ pagamento, onExpired }) => {
  const [secondsLeft, setSecondsLeft] = useState(pagamento.expiracao_segundos);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timer); onExpired(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onExpired]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pagamento.qr_code_payload).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-mono font-semibold text-terracota">{mm}:{ss}</p>
      <div className="border border-border rounded-xl p-3 bg-white">
        <img
          src={`data:image/png;base64,${pagamento.qr_code_image_b64}`}
          alt="QR Code PIX"
          className="w-52 h-52 object-contain"
        />
      </div>
      <p className="text-2xl font-bold font-playfair text-marrom-linho">
        R$ {Number(pagamento.valor_total).toFixed(2).replace('.', ',')}
      </p>
      <div className="w-full space-y-1">
        <p className="text-xs text-muted-foreground text-center">Pix Copia e Cola</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={pagamento.qr_code_payload}
            className="flex-1 text-xs bg-muted px-3 py-2 rounded-lg border border-border font-mono truncate"
          />
          <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Abra o app do banco, escolha PIX e escaneie o QR code ou cole o código.
      </p>
    </div>
  );
};

const SuccessView = ({ metodo, onClose }) => (
  <div className="flex flex-col items-center gap-3 py-6 text-center">
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
      <Check className="w-9 h-9 text-green-600" />
    </div>
    <p className="text-xl font-playfair font-bold text-green-700">
      {metodo === 'pix' ? 'Pagamento confirmado!' : 'Pedido aprovado!'}
    </p>
    <p className="text-sm text-muted-foreground">Seu pedido foi atualizado para Processando.</p>
    <Button data-testid="btn-fechar" onClick={onClose} className="btn-terracota mt-2">Fechar</Button>
  </div>
);

const RejectedView = ({ statusDetalhe, onRetry }) => (
  <div className="flex flex-col items-center gap-3 py-6 text-center">
    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
      <X className="w-9 h-9 text-red-600" />
    </div>
    <p className="text-xl font-playfair font-bold text-red-700">Pagamento recusado</p>
    <p className="text-sm text-muted-foreground">
      {STATUS_DETAIL_LABELS[statusDetalhe] || 'Verifique os dados e tente novamente.'}
    </p>
    <Button onClick={onRetry} variant="outline" className="mt-2">Tentar novamente</Button>
  </div>
);

const InProcessView = () => (
  <div className="flex flex-col items-center gap-3 py-6 text-center">
    <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
    <p className="text-xl font-playfair font-bold text-blue-700">Pagamento em análise</p>
    <p className="text-sm text-muted-foreground">
      Você receberá um e-mail com o resultado em breve.
    </p>
  </div>
);

const PagamentoModal = ({ orderId, orderTotal, onClose, onPaid }) => {
  const [tab, setTab] = useState('pix');
  const [step, setStep] = useState('form');
  const [pagamento, setPagamento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const stopPoll = () => clearInterval(pollRef.current);

  const reset = useCallback(() => {
    stopPoll();
    setStep('form');
    setPagamento(null);
    setError('');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!orderId) { stopPoll(); reset(); }
    return stopPoll;
  }, [orderId, reset]);

  useEffect(() => {
    if (step !== 'qrcode' || !pagamento) return;

    stopPoll();
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get(`/pagamentos/${pagamento.id}/`);
        if (data.status === 'approved') {
          stopPoll();
          setPagamento(data);
          setStep('success');
          onPaid?.(orderId);
        }
      } catch { /* silencioso */ }
    }, POLL_MS);

    return stopPoll;
  }, [step, pagamento, orderId, onPaid]);

  const handlePixSubmit = async ({ email, firstName, lastName, cpf }) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/pagamentos/', {
        order_id: orderId,
        metodo: 'pix',
        payer_email: email,
        payer_first_name: firstName,
        payer_last_name: lastName,
        payer_cpf: cpf,
      });
      setPagamento(data);
      setStep('qrcode');
    } catch (err) {
      setError(extractError(err) || 'Erro ao gerar PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/pagamentos/', {
        order_id: orderId,
        metodo: 'credit_card',
        payer_email: formData.payer.email,
        payer_cpf: formData.payer.identification?.number ?? '',
        token: formData.token,
        payment_method_id: formData.payment_method_id,
        installments: formData.installments,
        device_id: window.MP_DEVICE_SESSION_ID ?? '',
      });
      setPagamento(data);
      if (data.status === 'approved') {
        setStep('success');
        onPaid?.(orderId);
      } else if (['pending', 'in_process', 'authorized'].includes(data.status)) {
        setStep('processing');
      } else {
        setStep('rejected');
      }
    } catch (err) {
      setError(extractError(err) || 'Erro ao processar cartão.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    if (newTab === tab) return;
    reset();
    setTab(newTab);
  };

  const isOpen = !!orderId;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-playfair text-marrom-linho">
            Pagamento — Pedido #{orderId}
          </DialogTitle>
        </DialogHeader>

        {step === 'success' && <SuccessView metodo={tab} onClose={onClose} />}
        {step === 'rejected' && (
          <RejectedView statusDetalhe={pagamento?.status_detalhe} onRetry={reset} />
        )}
        {step === 'processing' && <InProcessView />}

        {step === 'qrcode' && pagamento && (
          <QrCodeView pagamento={pagamento} onExpired={reset} />
        )}

        {step === 'form' && (
          <>
            <div className="flex border border-border rounded-lg overflow-hidden mb-4">
              <button
                data-testid="tab-pix"
                onClick={() => handleTabChange('pix')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                  tab === 'pix'
                    ? 'bg-terracota text-white'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <QrCode className="w-4 h-4" /> PIX
              </button>
              <button
                data-testid="tab-card"
                onClick={() => handleTabChange('credit_card')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                  tab === 'credit_card'
                    ? 'bg-terracota text-white'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Cartão de crédito
              </button>
            </div>

            {tab === 'pix' && (
              <PixForm onSubmit={handlePixSubmit} loading={loading} error={error} />
            )}

            {tab === 'credit_card' && (
              <div>
                {MP_KEY_VALID ? (
                  <>
                    <CardPayment
                      initialization={{ amount: orderTotal }}
                      onSubmit={handleCardSubmit}
                      onError={(err) => setError(err?.message || 'Erro no formulário do cartão.')}
                      customization={{
                        paymentMethods: { maxInstallments: 12 },
                        visual: {
                          style: {
                            customVariables: {
                              baseColor: '#c17a4a',
                              baseColorFirstVariant: '#a0623b',
                              baseColorSecondVariant: '#8b5230',
                              errorColor: '#ef4444',
                              textPrimaryColor: '#3b1f0e',
                              inputBackgroundColor: '#ffffff',
                              formBackgroundColor: '#fdf8f3',
                              borderRadiusFull: '8px',
                            },
                          },
                        },
                      }}
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                  </>
                ) : (
                  <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                    Pagamento por cartão indisponível: configure a variável{' '}
                    <code className="font-mono">VITE_MP_PUBLIC_KEY</code> no arquivo{' '}
                    <code className="font-mono">frontend/.env</code> com a Public Key do Mercado Pago.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PagamentoModal;
