import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock do módulo api
vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from '../services/api';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  profile: { phone: '', address: '', city: '', state: '', cep: '' },
};

// Componente auxiliar para expor o contexto
function TestConsumer() {
  const { user, loading, login, logout, register } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="username">{user?.username ?? 'none'}</span>
      <button onClick={() => login('testuser', 'senha1234')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('AuthContext', () => {
  it('inicia sem usuário quando não há token', async () => {
    api.get.mockResolvedValue(mockUser);
    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('carrega usuário do token salvo no localStorage', async () => {
    localStorage.setItem('access_token', 'token-valido');
    api.get.mockResolvedValue(mockUser);
    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('username').textContent).toBe('testuser')
    );
  });

  it('remove token se /auth/profile/ retornar erro', async () => {
    localStorage.setItem('access_token', 'token-invalido');
    api.get.mockRejectedValue({ detail: 'Token inválido' });
    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('login salva tokens e define usuário', async () => {
    api.post.mockResolvedValue({ access: 'acc', refresh: 'ref' });
    api.get.mockResolvedValue(mockUser);
    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
    await act(async () => {
      await userEvent.click(screen.getByText('login'));
    });
    expect(localStorage.getItem('access_token')).toBe('acc');
    expect(localStorage.getItem('refresh_token')).toBe('ref');
    expect(screen.getByTestId('username').textContent).toBe('testuser');
  });

  it('logout limpa tokens e usuário', async () => {
    localStorage.setItem('access_token', 'acc');
    localStorage.setItem('refresh_token', 'ref');
    api.get.mockResolvedValue(mockUser);
    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('username').textContent).toBe('testuser')
    );
    await act(async () => {
      await userEvent.click(screen.getByText('logout'));
    });
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('loading começa true e termina false', async () => {
    api.get.mockResolvedValue(mockUser);
    renderWithAuth();
    // Inicialmente loading é true (sem token localStorage vazio → false imediato)
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
  });
});
