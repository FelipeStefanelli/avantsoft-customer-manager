import React, { useEffect, useState } from 'react'
import { HiSelector } from 'react-icons/hi'
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import {
  fetchClientsRaw,
  createClientRaw,
  updateClientRaw,
  deleteClientRaw,
} from '../../services/api'
import type { ClientRaw } from '../../services/api'
import { firstMissingLetter } from '../../utils/stringUtils'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Modal from '../../components/Modal/Modal'
import styles from './ClientsPage.module.scss'

interface ClientNorm {
  id: number
  nome: string
  email: string
  nascimento: string
  totalVolume: number
  mediaVenda: number
  frequenciaDias: number
  letraFaltante: string
}

type FormInfo = ClientRaw['info']
const initialForm: FormInfo = {
  nomeCompleto: '',
  detalhes: { email: '', nascimento: '' },
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<ClientNorm[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [form, setForm] = useState<FormInfo>(initialForm)

  const [sortBy, setSortBy] = useState<keyof ClientNorm | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [clientsPerPage, setClientsPerPage] = useState(10)

  const normalize = (raw: ClientRaw, idx: number): ClientNorm => {
    const vendas = raw.estatisticas.vendas
    const total = vendas.reduce((sum, value) => sum + value.valor, 0)
    return {
      id: idx,
      nome: raw.info.nomeCompleto,
      email: raw.info.detalhes.email,
      nascimento: raw.info.detalhes.nascimento,
      totalVolume: total,
      mediaVenda: Number((total / (vendas.length || 1)).toFixed(2)),
      frequenciaDias: new Set(vendas.map(v => v.data)).size,
      letraFaltante: firstMissingLetter(raw.info.nomeCompleto),
    }
  }

  useEffect(() => {
    fetchClientsRaw()
      .then(raws => setClients(raws.map(normalize)))
      .catch(() => toast.error('Erro ao carregar clientes'))
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setModalMode('add')
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEdit = (client: ClientNorm) => {
    setModalMode('edit')
    setCurrentId(client.id)
    setForm({
      nomeCompleto: client.nome,
      detalhes: { email: client.email, nascimento: client.nascimento },
    })
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const handleSave = async () => {
    try {
      const payload = {
        info: {
          nomeCompleto: form.nomeCompleto,
          detalhes: {
            email: form.detalhes.email,
            nascimento: form.detalhes.nascimento,
          },
        },
      }

      if (modalMode === 'add') {
        const novo = await createClientRaw(payload)
        setClients(prev => [...prev, normalize(novo, prev.length)])
        toast.success('Cliente adicionado com sucesso!')
      } else if (currentId !== null) {
        const updated = await updateClientRaw(currentId, payload)
        setClients(prev =>
          prev.map(client => (client.id === currentId ? normalize(updated, currentId) : client))
        )
        toast.success('Cliente atualizado com sucesso!')
      }
      closeModal()
    } catch {
      toast.error(modalMode === 'add' ? 'Erro ao adicionar cliente.' : 'Erro ao salvar cliente.')
    }
  }

  const handleDelete = async (id: number, nome: string) => {
    if (!confirm(`Deseja deletar o cliente "${nome}"?`)) return
    try {
      await deleteClientRaw(id)
      setClients(prev => prev.filter(client => client.id !== id))
    } catch {
      toast.error('Erro ao deletar cliente.')
    }
  }

  const toggleSort = (field: keyof ClientNorm) => {
    if (sortBy === field) setSortAsc(!sortAsc)
    else {
      setSortBy(field)
      setSortAsc(true)
    }
  }

  const getSortIcon = (field: keyof ClientNorm) =>
    sortBy === field ? (
      sortAsc ? (
        <FiChevronUp className={styles.icon} />
      ) : (
        <FiChevronDown className={styles.icon} />
      )
    ) : (
      <HiSelector className={styles.iconInactive} />
    )

  if (loading) {
    return <div className={styles.loading}>Carregando…</div>
  }

  const filtered = clients.filter(client => client.nome.toLowerCase().includes(filter.toLowerCase()) || client.email.toLowerCase().includes(filter.toLowerCase()))

  const sorted = sortBy ?
    [...filtered].sort((a, b) => {
      const valueA = a[sortBy]!
      const valueB = b[sortBy]!
      let comparison = 0

      if (sortBy === 'nascimento') {
        const dateA = new Date(valueA as string).getTime()
        const dateB = new Date(valueB as string).getTime()
        comparison = dateA - dateB
      }

      else if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB
      }

      else {
        comparison = String(valueA).localeCompare(String(valueB))
      }

      return sortAsc ? comparison : -comparison
    })
    :
    filtered

  const totalPages = Math.ceil(sorted.length / clientsPerPage)
  const paginated = sorted.slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)

  const columns: Array<{
    label: string
    field: keyof ClientNorm
    hide?: string
  }> = [
      { label: 'Nome', field: 'nome' },
      { label: 'E-mail', field: 'email', hide: 'sm' },
      { label: 'Nascimento', field: 'nascimento', hide: 'md' },
      { label: 'Total', field: 'totalVolume' },
      { label: 'Média', field: 'mediaVenda', hide: 'sm' },
      { label: 'Freq. Dias', field: 'frequenciaDias', hide: 'lg' },
      { label: 'Letra', field: 'letraFaltante', hide: 'lg' },
    ]

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Clientes</h1>

      <div className={styles.topControls}>
        <Button variant='primary' size='medium' onClick={openAdd}>
          Adicionar Cliente
        </Button>
        <div className={styles.topControlsFilters}>
          <Input
            id='searchClient'
            type="text"
            icon={<FiSearch />}
            placeholder='Buscar por nome ou e-mail'
            value={filter}
            onChange={e => {
              setFilter(e.target.value)
              setCurrentPage(1)
            }}
            className={styles.search}
          />
          <div className={styles.topControlsPerPage}>
            <label htmlFor='perPage'>Clientes por página:</label>{' '}
            <select
              id='perPage'
              value={clientsPerPage}
              onChange={e => {
                setClientsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className={styles.select}
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.field}
                  className={classNames(styles.th, col.hide && styles[col.hide])}
                >
                  <button
                    className={styles.sortBtn}
                    onClick={() => toggleSort(col.field)}
                  >
                    {col.label}
                    {getSortIcon(col.field)}
                  </button>
                </th>
              ))}
              <th
                className={classNames(styles.th, styles.thActions)}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(client => (
              <tr key={client.id} className={styles.tr}>
                {columns.map(col => (
                  <td
                    key={col.field}
                    className={classNames(
                      styles.td,
                      col.hide && styles[col.hide]
                    )}
                  >
                    {col.field === 'totalVolume'
                      ? client.totalVolume.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                      : col.field === 'mediaVenda'
                        ? client.mediaVenda.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                        : col.field === 'nascimento'
                          ? client.nascimento.split('-').reverse().join('/')
                          : col.field === 'frequenciaDias'
                            ? client.frequenciaDias === 0
                              ? '-'
                              : client.frequenciaDias === 1
                                ? `${client.frequenciaDias} dia`
                                : `${client.frequenciaDias} dias`
                            : (client[col.field] as string)}
                  </td>
                ))}
                <td className={styles.tdActions}>
                  <Button
                    variant='primary'
                    size='small'
                    onClick={() => openEdit(client)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant='secondary'
                    size='small'
                    onClick={() => handleDelete(client.id, client.nome)}
                  >
                    Deletar
                  </Button>
                </td>
              </tr>
            ))}
            {!paginated.length && (
              <tr>
                <td colSpan={columns.length + 1} className={styles.empty}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <Button
          size='small'
          onClick={() =>
            setCurrentPage(prev => Math.max(prev - 1, 1))
          }
          disabled={currentPage === 1}
        >
          Anterior
        </Button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1
          const isActive = pageNumber === currentPage

          return (
            <button
              key={pageNumber}
              className={classNames(styles.pageBtn, isActive && styles.pageBtnActive)}
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        })}

        <Button
          size='small'
          onClick={() =>
            setCurrentPage(prev => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Próxima
        </Button>
      </div>

      <Modal
        isOpen={modalOpen}
        title={modalMode === 'add' ? 'Adicionar Cliente' : 'Editar Cliente'}
        onClose={closeModal}
      >
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSave()
          }}
          className={styles.modalForm}
        >
          <Input
            id='clientFullName'
            type="text"
            label='Nome completo'
            value={form.nomeCompleto}
            onChange={e =>
              setForm(prev => ({ ...prev, nomeCompleto: e.target.value }))
            }
            required
          />
          <Input
            id='clientEmail'
            label='E-mail'
            type='email'
            value={form.detalhes.email}
            onChange={e =>
              setForm(prev => ({ ...prev, detalhes: { ...prev.detalhes, email: e.target.value } }))
            }
            required
          />
          <Input
            id='clientBirthDay'
            label='Nascimento'
            type='date'
            value={form.detalhes.nascimento}
            onChange={e =>
              setForm(prev => ({ ...prev, detalhes: { ...prev.detalhes, nascimento: e.target.value } }))
            }
            required
          />
          <div className={styles.modalActions}>
            <Button
              variant='primary'
              size='medium'
              type='submit'
            >
              Salvar
            </Button>
            <Button
              variant='secondary'
              size='medium'
              onClick={closeModal}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ClientsPage
