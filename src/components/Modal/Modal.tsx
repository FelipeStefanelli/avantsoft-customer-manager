import React, { ReactNode, useEffect } from 'react'
import styles from './Modal.module.scss'

interface ModalProps {
  isOpen: boolean
  title?: string
  onClose: () => void
  children: ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        {title && <header className={styles.header}><h2>{title}</h2></header>}
        <div className={styles.body}>{children}</div>
        <button className={styles.closeBtn} onClick={onClose} aria-label='Fechar'>&times;</button>
      </div>
    </div>
  )
}

export default Modal
