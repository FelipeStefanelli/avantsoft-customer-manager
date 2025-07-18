export interface ClientRaw {
  info: {
    nomeCompleto: string
    detalhes: {
      email: string
      nascimento: string
    }
  }
  duplicado?: {
    nomeCompleto: string
  }
  estatisticas: {
    vendas: Array<{ data: string; valor: number }>
  }
}

export interface ClientsRawResponse {
  data: {
    clientes: ClientRaw[]
  }
}

export interface SalesByDayItem {
  data: string
  total: number
}

export interface SalesByDayResponse {
  data: SalesByDayItem[]
}

export interface TopClientsResponse {
  data: {
    topVolume: { client: ClientRaw; total: number }
    topAverage: { client: ClientRaw; average: number }
    topFrequency: { client: ClientRaw; frequency: number }
  }
}

const API_BASE = '/api'
const TOKEN_KEY = 'toyshop_token'

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error(`Erro ao autenticar (${res.status})`)
  const { token } = await res.json()
  localStorage.setItem(TOKEN_KEY, token)
  return token
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) throw new Error('Não autenticado: faça login antes.')
  return { Authorization: `Bearer ${token}` }
}

export async function fetchClientsRaw(search?: string): Promise<ClientRaw[]> {
  const url = new URL(`${API_BASE}/clients`, window.location.origin)
  if (search) url.searchParams.set('search', search)
  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Erro ao buscar clientes (${res.status})`)
  const json: ClientsRawResponse = await res.json()
  return json.data.clientes
}

export async function createClientRaw(
  client: Omit<ClientRaw, 'estatisticas' | 'duplicado'>
): Promise<ClientRaw> {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ ...client, estatisticas: { vendas: [] } }),
  })
  if (!res.ok) throw new Error(`Erro ao criar cliente (${res.status})`)
  return res.json()
}

export async function updateClientRaw(
  id: number,
  client: Omit<ClientRaw, 'estatisticas' | 'duplicado'>
): Promise<ClientRaw> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ ...client, estatisticas: { vendas: [] } }),
  })
  if (!res.ok) throw new Error(`Erro ao editar cliente (${res.status})`)
  return res.json()
}

export async function deleteClientRaw(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Erro ao deletar cliente (${res.status})`)
}

export async function fetchSalesByDay(): Promise<SalesByDayItem[]> {
  const res = await fetch(`${API_BASE}/stats/sales-by-day`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Erro ao buscar vendas por dia (${res.status})`)
  const json: SalesByDayResponse = await res.json()
  return json.data
}

export async function fetchTopClients(): Promise<TopClientsResponse['data']> {
  const res = await fetch(`${API_BASE}/stats/top-clients`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Erro ao buscar top clients (${res.status})`)
  const json: TopClientsResponse = await res.json()
  return json.data
}
