import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientsPage from '../ClientsPage/ClientsPage';
import { AuthProvider } from '../../hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';

jest.mock('../../services/api', () => ({
  fetchClientsRaw: jest.fn(),
  createClientRaw: jest.fn(),
  updateClientRaw: jest.fn(),
  deleteClientRaw: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import {
  fetchClientsRaw,
  createClientRaw,
  updateClientRaw,
  deleteClientRaw,
} from '../../services/api';

describe('ClientsPage CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (fetchClientsRaw as jest.Mock).mockResolvedValue([
      {
        info: {
          nomeCompleto: 'Ana Beatriz',
          detalhes: { email: 'ana.b@example.com', nascimento: '1990-01-01' },
        },
        estatisticas: { vendas: [{ valor: 100, data: '2023-01-01' }] },
      },
      {
        info: {
          nomeCompleto: 'Carlos Eduardo',
          detalhes: { email: 'carlos@example.com', nascimento: '1985-05-05' },
        },
        estatisticas: { vendas: [{ valor: 200, data: '2023-01-02' }] },
      },
    ]);

    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderPage() {
    return render(
      <AuthProvider>
        <MemoryRouter>
          <ClientsPage />
        </MemoryRouter>
      </AuthProvider>
    );
  }

  test('Should create a new client correctly', async () => {
    renderPage();

    await waitFor(() => screen.getByText('Ana Beatriz'));

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Cliente/i }));

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'joao@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Nascimento/i), {
      target: { value: '1990-12-31' },
    });

    (createClientRaw as jest.Mock).mockResolvedValue({
      info: {
        nomeCompleto: 'João Silva',
        detalhes: { email: 'joao@example.com', nascimento: '1990-12-31' },
      },
      estatisticas: { vendas: [] },
    });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('joao@example.com')).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith('Cliente adicionado com sucesso!');
    });
  });

  test('Should edit a client correctly', async () => {
    renderPage();

    await waitFor(() => screen.getByText('Ana Beatriz'));

    const editButtons = screen.getAllByRole('button', { name: /Editar/i });
    fireEvent.click(editButtons[0]);

    const nomeInput = screen.getByDisplayValue('Ana Beatriz');
    const emailInput = screen.getByDisplayValue('ana.b@example.com');

    fireEvent.change(nomeInput, { target: { value: 'Ana B.' } });
    fireEvent.change(emailInput, { target: { value: 'anab@example.com' } });

    (updateClientRaw as jest.Mock).mockResolvedValue({
      info: {
        nomeCompleto: 'Ana B.',
        detalhes: { email: 'anab@example.com', nascimento: '1990-01-01' },
      },
      estatisticas: { vendas: [{ valor: 100, data: '2023-01-01' }] },
    });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => {
      expect(screen.getByText('Ana B.')).toBeInTheDocument();
      expect(screen.getByText('anab@example.com')).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith('Cliente atualizado com sucesso!');
    });
  });

  test('Should delete a client correctly', async () => {
    renderPage();

    await waitFor(() => screen.getByText('Carlos Eduardo'));

    const deleteButtons = screen.getAllByRole('button', { name: /Deletar/i });
    fireEvent.click(deleteButtons[1]);

    (deleteClientRaw as jest.Mock).mockResolvedValue(undefined);

    await waitFor(() => {
      expect(screen.queryByText('Carlos Eduardo')).not.toBeInTheDocument();
    });
  });
});
