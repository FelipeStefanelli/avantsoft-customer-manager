import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../LoginPage/LoginPage';
import { AuthProvider } from '../../hooks/useAuth';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'react-toastify';

jest.mock('../../services/authService');

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: {
    error: jest.fn(),
  },
}));

describe('LoginPage', () => {
  test('Should render the login page correctly', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/esqueci minha senha\?/i)).toBeInTheDocument();
  });

  test('Should successfully log in and navigate to the /clients page', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/clients" element={<div>Página dos Clientes</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/e-mail/i), {
      target: { value: 'usuario@teste.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: 'senha123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Página dos Clientes')).toBeInTheDocument();
    });
  });

  test('Should display toast error if credentials are incorrect', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    )

    fireEvent.change(screen.getByPlaceholderText(/e-mail/i), {
      target: { value: 'usuario@errado.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: 'senhaErrada' },
    })

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'As credenciais fornecidas não foram encontradas.'
      )
    )
  });

  test('Should correctly navigate to the password recovery page', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/forgot-password" element={<div>Página de Recuperação de Senha</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.click(screen.getByText(/esqueci minha senha\?/i));

    expect(screen.getByText('Página de Recuperação de Senha')).toBeInTheDocument();
  });
});
