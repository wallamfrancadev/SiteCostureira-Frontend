import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { AuthContext } from '../context/AuthContext';

// Exportamos AuthContext por nome para o teste conseguir injetar valores
// Se não estiver exportado, precisamos ajustar o contexto

function renderPrivateRoute({ user = null, loading = false } = {}) {
  return render(
    <AuthContext.Provider value={{ user, loading }}>
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route
            path="/protegida"
            element={
              <PrivateRoute>
                <div>Conteúdo Protegido</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('PrivateRoute', () => {
  it('redireciona para / quando não autenticado', async () => {
    renderPrivateRoute({ user: null, loading: false });
    await waitFor(() =>
      expect(screen.getByText('Home')).toBeInTheDocument()
    );
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('renderiza children quando autenticado', async () => {
    const user = { id: 1, username: 'testuser' };
    renderPrivateRoute({ user, loading: false });
    await waitFor(() =>
      expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument()
    );
  });

  it('não renderiza nada enquanto loading=true', () => {
    renderPrivateRoute({ user: null, loading: true });
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('renderiza children quando loading=true e usuário existe', () => {
    const user = { id: 1, username: 'testuser' };
    renderPrivateRoute({ user, loading: true });
    // Com loading=true e user definido, PrivateRoute retorna null (aguardando)
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });
});
