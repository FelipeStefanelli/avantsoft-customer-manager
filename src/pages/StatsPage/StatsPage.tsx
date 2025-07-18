import React, { useEffect, useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import classNames from 'classnames'
import { fetchClientsRaw } from '../../services/api'
import Input from '../../components/Input/Input'
import styles from './StatsPage.module.scss'

interface SalePerDay {
  data: string
  total: number
  count: number
}

interface SummaryItem {
  nome: string
  value: number
}

interface Summary {
  highestVolume: SummaryItem
  highestAverage: SummaryItem
  highestFrequency: { nome: string; dias: number }
}

const StatsPage: React.FC = () => {
  const [sales, setSales] = useState<SalePerDay[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    fetchClientsRaw()
      .then(clients => {
        const map: Record<string, { total: number; count: number }> = {}
        clients.forEach(client =>
          client.estatisticas.vendas.forEach(v => {
            if (!map[v.data]) map[v.data] = { total: 0, count: 0 }
            map[v.data].total += v.valor
            map[v.data].count += 1
          })
        )
        const salesArray = Object.entries(map).map(([data, { total, count }]) => ({ data, total, count })).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

        setSales(salesArray)

        if (salesArray.length) {
          const lastRecord = new Date(salesArray[salesArray.length - 1].data)
          const thirtyDaysAgo = new Date(lastRecord.getTime() - 30 * 24 * 60 * 60 * 1000)
          const formatDate = (d: Date) => d.toISOString().slice(0, 10)
          setStartDate(formatDate(thirtyDaysAgo))
          setEndDate(formatDate(lastRecord))
        }

        type ClientSalesStats = { nome: string; total: number; media: number; freq: number }
        const stats: ClientSalesStats[] = clients.map(client => {
          const total = client.estatisticas.vendas.reduce((s, v) => s + v.valor, 0)
          const media = total / (client.estatisticas.vendas.length || 1)
          const freq = new Set(client.estatisticas.vendas.map(v => v.data)).size
          return { nome: client.info.nomeCompleto, total, media, freq }
        })
        const maxBy = (array: ClientSalesStats[], getValue: (client: ClientSalesStats) => number) => array.reduce((a, b) => (getValue(b) > getValue(a) ? b : a), array[0])

        const highestVolume = maxBy(stats, client => client.total)
        const highestAverage = maxBy(stats, client => client.media)
        const highestFrequency = maxBy(stats, client => client.freq)

        setSummary({
          highestVolume: { nome: highestVolume.nome, value: highestVolume.total },
          highestAverage: { nome: highestAverage.nome, value: Number(highestAverage.media.toFixed(2)) },
          highestFrequency: { nome: highestFrequency.nome, dias: highestFrequency.freq },
        })
      })
      .catch((err) => {
        alert('Erro ao carregar estatísticas')
        console.error('Erro ao carregar estatísticas', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredSales = useMemo(() => {
    if (!startDate || !endDate) return sales
    return sales.filter(sale => sale.data >= startDate && sale.data <= endDate)
  }, [sales, startDate, endDate])

  if (loading || !summary) {
    return <div className={styles.loading}>Carregando estatísticas…</div>
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Estatísticas de Vendas</h1>

      <div className={styles.cards}>
        <div className={classNames(styles.card, styles.cardVolume)}>
          <h2>Maior Volume</h2>
          <p>{summary.highestVolume.nome}</p>
          <span>
            {summary.highestVolume.value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
        <div className={classNames(styles.card, styles.cardAverage)}>
          <h2>Maior Média</h2>
          <p>{summary.highestAverage.nome}</p>
          <span>
            {summary.highestAverage.value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
        <div className={classNames(styles.card, styles.cardFrequency)}>
          <h2>Maior Frequência</h2>
          <p>{summary.highestFrequency.nome}</p>
          <span>{summary.highestFrequency.dias} dias</span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <div className={styles.chartHeader}>
          <h2>Vendas por Dia</h2>
          <div className={styles.dateFilters}>
            <Input
              id='salesStartDate'
              type='date'
              value={startDate}
              max={endDate}
              onChange={e => setStartDate(e.target.value)}
              className={styles.filterInput}
            />
            <Input
              id='salesEndDate'
              type='date'
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
              className={styles.filterInput}
            />
          </div>
        </div>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={filteredSales} className={styles.chart}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='data'
              interval="preserveStartEnd"
              minTickGap={40}
              tickMargin={10}
              tickFormatter={(dateStr: string) =>
                dateStr.split('-').reverse().join('/')
              }
            />
            <YAxis yAxisId='left' tickFormatter={v => `R$ ${v}`} />
            <YAxis yAxisId='right' hide />
            <Tooltip
              labelFormatter={(dateStr: string) =>
                dateStr.split('-').reverse().join('/')
              }
              formatter={(value: number, name: string) =>
                name === 'Vendas' ? `${value}` : `R$ ${value}`
              }
            />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='total'
              name='Valor Total'
              stroke='#2aacc9'
              strokeWidth={2}
              dot
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='count'
              name='Vendas'
              stroke='#35ad68'
              strokeWidth={0}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StatsPage
