import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PagamentoModal from '../components/PagamentoModal';

vi.mock('@mercadopago/sdk-react', () => ({
  initMercadoPago: vi.fn(),
  CardPayment: ({ onSubmit, onError, initialization }) => (
    <div data-testid="card-brick">
      <span data-testid="card-amount">{initialization?.amount}</span>
      <button
        data-testid="card-submit"
        onClick={() =>
          onSubmit({
            token: 'tok_test_123',
            payment_method_id: 'visa',
            installments: 1,
            payer: {
              email: 'card@test.com',
              identification: { type: 'CPF', number: '12345678901' },
            },
          })
        }
      >
        Pagar cartão
      </button>
      <button data-testid="card-error" onClick={() => onError({ message: 'Erro no cartão' })}>
        Simular erro
      </button>
    </div>
  ),
}));

vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from '../services/api';

const PIX_RESPONSE = {
  id: 1,
  id_pagamento_externo: '111222333',
  status: 'pending',
  metodo_pagamento: 'pix',
  valor_total: '150.00',
  qr_code_payload: '00020101021226940014br.gov.bcb.pix',
  qr_code_image_b64: 'iVBORw0KGgo=',
  ticket_url: '',
  expiracao_segundos: 3600,
  parcelas: 1,
  data_criacao: '2024-01-01T10:00:00Z',
  pago_em: null,
  order: 1,
};

const CARD_APPROVED_RESPONSE = {
  ...PIX_RESPONSE,
  id: 2,
  id_pagamento_externo: '444555666',
  status: 'approved',
  metodo_pagamento: 'credit_card',
  qr_code_payload: '',
  qr_code_image_b64: '',
};

const CARD_REJECTED_RESPONSE = {
  ...CARD_APPROVED_RESPONSE,
  status: 'rejected',
  status_detalhe: 'cc_rejected_insufficient_amount',
};

const defaultProps = {
  orderId: 42,
  orderTotal: 150.0,
  onClose: vi.fn(),
  onPaid: vi.fn(),
};

function renderModal(props = {}) {
  return render(<PagamentoModal {...defaultProps} {...props} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Renderização inicial
// ---------------------------------------------------------------------------

describe('PagamentoModal — renderização', () => {
  it('não renderiza quando orderId é null', () => {
    renderModal({ orderId: null });
    expect(screen.queryByText(/Pagamento/i)).toBeNull();
  });

  it('mostra o número do pedido no título', () => {
    renderModal();
    expect(screen.getByText(/Pedido #42/i)).toBeTruthy();
  });

  it('renderiza tab PIX selecionada por padrão', () => {
    renderModal();
    const pixTab = screen.getByTestId('tab-pix');
    expect(pixTab.className).toContain('bg-terracota');
  });

  it('renderiza tab Cartão de crédito', () => {
    renderModal();
    expect(screen.getByTestId('tab-card')).toBeTruthy();
  });

  it('mostra o CardPayment brick ao clicar na tab Cartão', async () => {
    renderModal();
    await userEvent.click(screen.getByTestId('tab-card'));
    expect(screen.getByTestId('card-brick')).toBeTruthy();
  });

  it('CardPayment recebe o valor total correto', async () => {
    renderModal({ orderTotal: 250.0 });
    await userEvent.click(screen.getByTestId('tab-card'));
    expect(screen.getByTestId('card-amount').textContent).toBe('250');
  });
});

// ---------------------------------------------------------------------------
// Formulário PIX
// ---------------------------------------------------------------------------

describe('PagamentoModal — formulário PIX', () => {
  it('mostra campos do pagador', () => {
    renderModal();
    expect(screen.getByLabelText('Nome')).toBeTruthy();
    expect(screen.getByLabelText('Sobrenome')).toBeTruthy();
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
    expect(screen.getByLabelText('CPF')).toBeTruthy();
  });

  it('submete PIX e exibe QR code', async () => {
    api.post.mockResolvedValue(PIX_RESPONSE);
    renderModal();

    await userEvent.type(screen.getByLabelText('Nome'), 'João');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva');
    await userEvent.type(screen.getByLabelText('E-mail'), 'joao@email.com');
    await userEvent.type(screen.getByLabelText('CPF'), '12345678901');
    await userEvent.click(screen.getByRole('button', { name: /Gerar QR Code/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/pagamentos/', expect.objectContaining({
      order_id: 42,
      metodo: 'pix',
      payer_email: 'joao@email.com',
    })));

    await waitFor(() => expect(screen.getByAltText('QR Code PIX')).toBeTruthy());
  });

  it('exibe imagem do QR code com src base64', async () => {
    api.post.mockResolvedValue(PIX_RESPONSE);
    renderModal();

    await userEvent.type(screen.getByLabelText('Nome'), 'João');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva');
    await userEvent.type(screen.getByLabelText('E-mail'), 'j@j.com');
    await userEvent.type(screen.getByLabelText('CPF'), '12345678901');
    await userEvent.click(screen.getByRole('button', { name: /Gerar QR Code/i }));

    await waitFor(() => {
      const img = screen.getByAltText('QR Code PIX');
      expect(img.src).toContain('data:image/png;base64,iVBORw0KGgo=');
    });
  });

  it('exibe campo pix copia e cola', async () => {
    api.post.mockResolvedValue(PIX_RESPONSE);
    renderModal();

    await userEvent.type(screen.getByLabelText('Nome'), 'J');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'S');
    await userEvent.type(screen.getByLabelText('E-mail'), 'j@j.com');
    await userEvent.type(screen.getByLabelText('CPF'), '00000000000');
    await userEvent.click(screen.getByRole('button', { name: /Gerar QR Code/i }));

    await waitFor(() =>
      expect(screen.getByDisplayValue('00020101021226940014br.gov.bcb.pix')).toBeTruthy()
    );
  });

  it('exibe valor total no QR code', async () => {
    api.post.mockResolvedValue(PIX_RESPONSE);
    renderModal();

    await userEvent.type(screen.getByLabelText('Nome'), 'J');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'S');
    await userEvent.type(screen.getByLabelText('E-mail'), 'j@j.com');
    await userEvent.type(screen.getByLabelText('CPF'), '00000000000');
    await userEvent.click(screen.getByRole('button', { name: /Gerar QR Code/i }));

    await waitFor(() => expect(screen.getByText('R$ 150,00')).toBeTruthy());
  });

  it('exibe erro quando API falha', async () => {
    api.post.mockRejectedValue({ detail: 'Erro ao gerar PIX.' });
    renderModal();

    await userEvent.type(screen.getByLabelText('Nome'), 'J');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'S');
    await userEvent.type(screen.getByLabelText('E-mail'), 'j@j.com');
    await userEvent.type(screen.getByLabelText('CPF'), '00000000000');
    await userEvent.click(screen.getByRole('button', { name: /Gerar QR Code/i }));

    await waitFor(() => expect(screen.getByText(/Erro ao gerar PIX/i)).toBeTruthy());
  });

  it('não envia dados do cartão para o backend no fluxo PIX', async () => {
    api.post.mockResolvedValue(PIX_RESPONSE);
    renderModal();

    await userEvent.type(screen.getByLabelText('Nome'), 'J');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'S');
    await userEvent.type(screen.getByLabelText('E-mail'), 'j@j.com');
    await userEvent.type(screen.getByLabelText('CPF'), '00000000000');
    await userEvent.click(screen.getByRole('button', { name: /Gerar QR Code/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const body = api.post.mock.calls[0][1];
    expect(body).not.toHaveProperty('token');
    expect(body).not.toHaveProperty('card_number');
  });
});

// ---------------------------------------------------------------------------
// Fluxo Cartão
// ---------------------------------------------------------------------------

describe('PagamentoModal — cartão de crédito', () => {
  async function openCard() {
    renderModal();
    await userEvent.click(screen.getByTestId('tab-card'));
  }

  it('submete cartão aprovado e exibe sucesso', async () => {
    api.post.mockResolvedValue(CARD_APPROVED_RESPONSE);
    await openCard();
    await userEvent.click(screen.getByTestId('card-submit'));

    await waitFor(() => expect(screen.getByText(/Pedido aprovado/i)).toBeTruthy());
  });

  it('chama onPaid quando cartão aprovado', async () => {
    api.post.mockResolvedValue(CARD_APPROVED_RESPONSE);
    await openCard();
    await userEvent.click(screen.getByTestId('card-submit'));

    await waitFor(() => expect(defaultProps.onPaid).toHaveBeenCalledWith(42));
  });

  it('não envia número do cartão para o backend — só token', async () => {
    api.post.mockResolvedValue(CARD_APPROVED_RESPONSE);
    await openCard();
    await userEvent.click(screen.getByTestId('card-submit'));

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const body = api.post.mock.calls[0][1];
    expect(body.token).toBe('tok_test_123');
    expect(body).not.toHaveProperty('card_number');
    expect(body).not.toHaveProperty('cvv');
    expect(body).not.toHaveProperty('expiry');
  });

  it('exibe status recusado e botão tentar novamente', async () => {
    api.post.mockResolvedValue(CARD_REJECTED_RESPONSE);
    await openCard();
    await userEvent.click(screen.getByTestId('card-submit'));

    await waitFor(() => expect(screen.getByText(/Pagamento recusado/i)).toBeTruthy());
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeTruthy();
  });

  it('exibe mensagem legível para cartão sem saldo', async () => {
    api.post.mockResolvedValue(CARD_REJECTED_RESPONSE);
    await openCard();
    await userEvent.click(screen.getByTestId('card-submit'));

    await waitFor(() => expect(screen.getByText(/Saldo insuficiente/i)).toBeTruthy());
  });

  it('exibe erro do brick quando onError é chamado', async () => {
    api.post.mockResolvedValue(CARD_APPROVED_RESPONSE);
    await openCard();
    await userEvent.click(screen.getByTestId('card-error'));

    await waitFor(() => expect(screen.getByText('Erro no cartão')).toBeTruthy());
  });

  it('botão tentar novamente volta ao formulário', async () => {
    api.post.mockResolvedValue(CARD_REJECTED_RESPONSE);
    await openCard();
    await userEvent.click(screen.getByTestId('card-submit'));
    await waitFor(() => screen.getByRole('button', { name: /Tentar novamente/i }));

    await userEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));
    expect(screen.getByTestId('card-brick')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Polling de status PIX
// ---------------------------------------------------------------------------

describe('PagamentoModal — polling PIX', () => {
  async function submitPixForm() {
    await userEvent.type(screen.getByLabelText('Nome'), 'J');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'S');
    await userEvent.type(screen.getByLabelText('E-mail'), 'j@j.com');
    await userEvent.type(screen.getByLabelText('CPF'), '00000000000');
    await userEvent.click(screen.getByRole('button', { name: /Gerar QR Code/i }));
  }

  it('chama API de status após intervalo', async () => {
    api.post.mockResolvedValue(PIX_RESPONSE);
    api.get.mockResolvedValue({ ...PIX_RESPONSE, status: 'pending' });

    renderModal();
    await submitPixForm();
    await waitFor(() => expect(screen.getByAltText('QR Code PIX')).toBeTruthy());

    await waitFor(
      () => expect(api.get).toHaveBeenCalledWith(`/pagamentos/${PIX_RESPONSE.id}/`),
      { timeout: 7000 },
    );
  }, 10000);

  it('exibe sucesso quando polling retorna approved', async () => {
    api.post.mockResolvedValue(PIX_RESPONSE);
    api.get.mockResolvedValue({ ...PIX_RESPONSE, status: 'approved' });

    renderModal();
    await submitPixForm();
    await waitFor(() => expect(screen.getByAltText('QR Code PIX')).toBeTruthy());

    await waitFor(
      () => expect(screen.getByText(/Pagamento confirmado/i)).toBeTruthy(),
      { timeout: 7000 },
    );
    expect(defaultProps.onPaid).toHaveBeenCalledWith(42);
  }, 10000);
});

// ---------------------------------------------------------------------------
// Troca de tabs e reset de estado
// ---------------------------------------------------------------------------

describe('PagamentoModal — troca de tab', () => {
  it('trocar para cartão limpa erro do PIX', async () => {
    api.post.mockRejectedValue({ detail: 'Falha PIX' });
    renderModal();

    await userEvent.type(screen.getByLabelText('Nome'), 'J');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'S');
    await userEvent.type(screen.getByLabelText('E-mail'), 'j@j.com');
    await userEvent.type(screen.getByLabelText('CPF'), '00000000000');
    await userEvent.click(screen.getByRole('button', { name: /Gerar QR Code/i }));
    await waitFor(() => screen.getByText(/Falha PIX/i));

    await userEvent.click(screen.getByTestId('tab-card'));
    expect(screen.queryByText(/Falha PIX/i)).toBeNull();
  });

  it('trocar para PIX exibe formulário do pagador', async () => {
    renderModal();
    await userEvent.click(screen.getByTestId('tab-card'));
    await userEvent.click(screen.getByTestId('tab-pix'));
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Fechamento
// ---------------------------------------------------------------------------

describe('PagamentoModal — fechamento', () => {
  it('chama onClose ao clicar fora do modal (onOpenChange false)', async () => {
    renderModal();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('chama onClose ao clicar em Fechar no estado de sucesso', async () => {
    api.post.mockResolvedValue(CARD_APPROVED_RESPONSE);
    renderModal();
    await userEvent.click(screen.getByTestId('tab-card'));
    await userEvent.click(screen.getByTestId('card-submit'));
    await waitFor(() => screen.getByTestId('btn-fechar'));

    await userEvent.click(screen.getByTestId('btn-fechar'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
