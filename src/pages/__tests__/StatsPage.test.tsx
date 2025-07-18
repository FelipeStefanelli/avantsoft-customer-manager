import { render, screen, waitFor, within } from '@testing-library/react';
import StatsPage from '../StatsPage/StatsPage';
import { AuthProvider } from '../../hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../../services/api';

jest.mock('../../services/api');

const mockClients: api.ClientRaw[] = [
  {
    info: {
      nomeCompleto: 'Ana Beatriz',
      detalhes: {
        email: 'ana@teste.com',
        nascimento: '1990-01-01'
      }
    },
    estatisticas: {
      vendas: [
        { data: '2023-06-01', valor: 100 },
        { data: '2023-06-02', valor: 100 },
        { data: '2023-06-03', valor: 0 },
      ],
    },
  },
  {
    info: {
      nomeCompleto: 'Carlos Eduardo',
      detalhes: {
        email: 'carlos@teste.com',
        nascimento: '1985-03-12'
      }
    },
    estatisticas: {
      vendas: [
        { data: '2023-06-01', valor: 50 },
        { data: '2023-06-02', valor: 150 },
        { data: '2023-06-03', valor: 200 },
        { data: '2023-06-04', valor: 200 },
      ],
    },
  },
  {
    info: {
      nomeCompleto: 'Fernanda Lima',
      detalhes: {
        email: 'fernanda@teste.com',
        nascimento: '1992-07-25'
      }
    },
    estatisticas: {
      vendas: [
        { data: '2023-06-01', valor: 80 },
        { data: '2023-06-10', valor: 180 },
        { data: '2023-06-30', valor: 90 },
      ],
    },
  },
];

describe('StatsPage', () => {
  beforeEach(() => {
    jest.spyOn(api, 'fetchClientsRaw').mockResolvedValue(mockClients);
  });

  test('Should displays key data correctly', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StatsPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('Estatísticas de Vendas')).toBeInTheDocument()
    );

    const volumeCard = screen.getByText('Maior Volume').closest('div');
    const averageCard = screen.getByText('Maior Média').closest('div');
    const frequencyCard = screen.getByText('Maior Frequência').closest('div');

    expect(within(volumeCard!).getByText('Carlos Eduardo')).toBeInTheDocument();
    expect(within(volumeCard!).getByText('R$ 600,00')).toBeInTheDocument();

    expect(within(averageCard!).getByText('Carlos Eduardo')).toBeInTheDocument();
    expect(within(averageCard!).getByText('R$ 150,00')).toBeInTheDocument();

    expect(within(frequencyCard!).getByText('Carlos Eduardo')).toBeInTheDocument();
    expect(within(frequencyCard!).getByText(/4\s*dias/i)).toBeInTheDocument();

    expect(screen.getByText('Vendas por Dia')).toBeInTheDocument();
  });
});
