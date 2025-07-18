import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../Modal/Modal'
import styles from '../Modal/Modal.module.scss'

describe('Modal', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    onClose.mockClear()
  })

  it('Should not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>
    )
    expect(container.firstChild).toBeNull()
  })

  it('Should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Título do Modal">
        <p>Conteúdo</p>
      </Modal>
    )
    expect(screen.getByText('Título do Modal')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('Should call onClose when the close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>
    )
    const closeBtn = screen.getByLabelText('Fechar')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Should call onClose when backdrop is clicked', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>
    )
    const backdrop = container.querySelector(`.${styles.backdrop}`)
    fireEvent.click(backdrop!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Should not call onClose when the click occurs inside the modal', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>
    )
    const modal = container.querySelector(`.${styles.modal}`)
    fireEvent.click(modal!)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Should call onClose when escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
