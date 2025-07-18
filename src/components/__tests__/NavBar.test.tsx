import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavBar from '../NavBar/NavBar'
import { useAuth } from '../../hooks/useAuth'

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}))

describe('NavBar', () => {
  const logoutMock = jest.fn()

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ logout: logoutMock })
    logoutMock.mockClear()
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    )

  it('Should render navigation links', () => {
    renderComponent()
    expect(screen.getAllByText(/Clientes/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Estatísticas/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Sair/i).length).toBeGreaterThan(0)
  })

  it('Should call logout when click exit(Sair) button', () => {
    renderComponent()
    const logoutBtn = screen.getAllByText('Sair')[0]
    fireEvent.click(logoutBtn)
    expect(logoutMock).toHaveBeenCalledTimes(1)
  })

  it('Should open and close the mobile menu correctly', () => {
    renderComponent()

    const toggleBtn = screen.getByLabelText('Abrir menu')
    fireEvent.click(toggleBtn)
    expect(screen.getByLabelText('Fechar menu')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Fechar menu'))
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })

  it('Should close the mobile menu when a link is clicked', () => {
    renderComponent()

    const toggleBtn = screen.getByLabelText('Abrir menu')
    fireEvent.click(toggleBtn)

    const clienteLinkMobile = screen.getAllByText('Clientes')[1]
    fireEvent.click(clienteLinkMobile)

    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })

  it('Should call logout and close the mobile menu when the button exit(Sair) is clicked', () => {
    renderComponent()

    const toggleBtn = screen.getByLabelText('Abrir menu')
    fireEvent.click(toggleBtn)

    const logoutBtnMobile = screen.getAllByText('Sair')[1]
    fireEvent.click(logoutBtnMobile)

    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })
})
