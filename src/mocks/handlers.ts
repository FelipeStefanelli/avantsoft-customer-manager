import { http, HttpResponse } from 'msw'
import type { ClientRaw } from '../services/api'

const fakeJWT = 'fake-jwt-token'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const names = [
  'Ana Beatriz', 'Carlos Eduardo', 'Mariana Silva', 'Pedro Santos',
  'João Souza', 'João Souza', 'Marcos Lima', 'Laura Costa',
  'Bruno Pereira', 'Juliana Rocha', 'Felipe Alves', 'Aline Fernandes',
  'Rodrigo Melo', 'Patrícia Nunes', 'Rafael Barros', 'Camila Castro',
  'Victor Martins', 'Amanda Dias', 'Gustavo Ribeiro', 'Bianca Gomes',
  'Lucas Cardoso', 'Fernanda Araújo', 'Eduardo Pinto', 'Carolina Barbosa',
  'Marcelo Monteiro', 'Renata Figueiredo', 'Ricardo Lopes', 'Tatiana Moreira',
  'André Rodrigues', 'Sofia Menezes'
]

let nextId = names.length + 1

function generateVendas(): Array<{ data: string; valor: number }> {
  const count = randomInt(0, 30)
  const vendas: Array<{ data: string; valor: number }> = []

  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  for (let i = 0; i < count; i++) {
    const randomTime =
      oneYearAgo.getTime() +
      Math.random() * (today.getTime() - oneYearAgo.getTime())
    const date = new Date(randomTime)
    const dataStr = date.toISOString().slice(0, 10)

    vendas.push({
      data: dataStr,
      valor: randomInt(20, 300),
    })
  }

  return vendas
}

export let clientsStore: Array<ClientRaw & { id: number }> = names.map(
  (nomeCompleto, idx) => ({
    id: idx + 1,
    info: {
      nomeCompleto,
      detalhes: {
        email: `${nomeCompleto
          .toLowerCase()
          .replace(/\s+/g, '.')}@example.com`,
        nascimento: `199${randomInt(0, 9)}-${String(
          randomInt(1, 12)
        ).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
      },
    },
    estatisticas: {
      vendas: generateVendas(),
    },
  })
)

const salesStore: Array<{
  clientId: number
  data: string
  valor: number
}> = []

function requireAuth(req: any) {
  const headersObj = req.headers ?? req.request?.headers
  const auth = headersObj?.get('Authorization')
  if (auth !== `Bearer ${fakeJWT}`) {
    return new HttpResponse(null, { status: 401 })
  }
}

function getSearchParam(req: any) {
  const url = new URL(req.url, 'http://localhost')
  return url.searchParams.get('search')?.toLowerCase() ?? ''
}

export const handlers = [
  http.post('/api/login', () => HttpResponse.json({ token: fakeJWT })),

  http.get('/api/clients', req => {
    const unauth = requireAuth(req)
    if (unauth) return unauth

    const search = getSearchParam(req)
    const filtered = clientsStore.filter(
      c =>
        c.info.nomeCompleto.toLowerCase().includes(search) ||
        c.info.detalhes.email.toLowerCase().includes(search)
    )

    const clientes = filtered.map(c => {
      const isDuplicado =
        clientsStore.filter(x => x.info.nomeCompleto === c.info.nomeCompleto)
          .length > 1
      return {
        info: c.info,
        ...(isDuplicado
          ? { duplicado: { nomeCompleto: c.info.nomeCompleto } }
          : {}),
        estatisticas: c.estatisticas,
      }
    })

    return HttpResponse.json({
      data: { clientes },
      meta: { registroTotal: clientes.length, pagina: 1 },
      redundante: { status: 'ok' },
    })
  }),

  http.post('/api/clients', async ({ request }) => {
    const unauth = requireAuth(request)
    if (unauth) return unauth

    const body = (await request.json()) as ClientRaw
    const novo = { ...body, id: nextId++ }
    clientsStore.push(novo)
    return HttpResponse.json(novo, { status: 201 })
  }),

  http.put('/api/clients/:id', async ({ request, params }) => {
    const unauth = requireAuth(request)
    if (unauth) return unauth

    const id = Number(params.id)
    const body = (await request.json()) as ClientRaw
    const updated = { ...body, id }
    clientsStore = clientsStore.map(c => (c.id === id ? updated : c))
    return HttpResponse.json(updated)
  }),

  http.delete('/api/clients/:id', ({ request, params }) => {
    const unauth = requireAuth(request)
    if (unauth) return unauth

    const id = Number(params.id)
    clientsStore = clientsStore.filter(c => c.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/sales', req => {
    const unauth = requireAuth(req)
    if (unauth) return unauth

    return HttpResponse.json({ data: { sales: salesStore } })
  }),

  http.post('/api/sales', async ({ request }) => {
    const unauth = requireAuth(request)
    if (unauth) return unauth

    const sale = (await request.json()) as {
      clientId: number
      data: string
      valor: number
    }
    salesStore.push(sale)
    return HttpResponse.json(sale, { status: 201 })
  }),

  http.get('/api/stats/sales-by-day', req => {
    const unauth = requireAuth(req)
    if (unauth) return unauth

    const totals: Record<string, number> = {}
    salesStore.forEach(s => {
      totals[s.data] = (totals[s.data] || 0) + s.valor
    })
    const data = Object.entries(totals).map(([data, total]) => ({
      data,
      total,
    }))
    return HttpResponse.json({ data })
  }),

  http.get('/api/stats/top-clients', req => {
    const unauth = requireAuth(req)
    if (unauth) return unauth

    type Stat = {
      client: ClientRaw
      total: number
      average: number
      frequency: number
    }

    const stats: Stat[] = clientsStore.map(c => {
      const vendas = salesStore.filter(s => s.clientId === c.id)
      const total = vendas.reduce((sum, v) => sum + v.valor, 0)
      const average = vendas.length ? total / vendas.length : 0
      const frequency = new Set(vendas.map(v => v.data)).size
      return {
        client: { info: c.info, estatisticas: { vendas } },
        total,
        average,
        frequency,
      }
    })

    if (!stats.length) {
      return HttpResponse.json({ data: {} })
    }

    const topVolume = stats.reduce((a, b) => (b.total > a.total ? b : a))
    const topAverage = stats.reduce((a, b) =>
      b.average > a.average ? b : a
    )
    const topFrequency = stats.reduce((a, b) =>
      b.frequency > a.frequency ? b : a
    )

    return HttpResponse.json({
      data: {
        topVolume: { client: topVolume.client, total: topVolume.total },
        topAverage: { client: topAverage.client, average: topAverage.average },
        topFrequency: {
          client: topFrequency.client,
          frequency: topFrequency.frequency,
        },
      },
    })
  }),
]
