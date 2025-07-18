import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiUsers, FiBarChart2, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Brand from '../../assets/avantsoft-brand.png'
import Button from '../../components/Button/Button'
import styles from './NavBar.module.scss'

const NavBar: React.FC = () => {
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggleMenu = () => setMobileOpen(prev => !prev)

  return (
    <nav className={styles.nav} aria-label='Main navigation'>
      <img className={styles.brand} src={Brand} alt='Brand Avantsoft' />

      <div className={styles.linkGroup}>
        <NavLink
          to='/clients'
          className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}
        >
          <FiUsers className={styles.icon} /> Clientes
        </NavLink>
        <NavLink
          to='/stats'
          className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}
        >
          <FiBarChart2 className={styles.icon} /> Estatísticas
        </NavLink>
      </div>

      <Button
        variant='danger'
        size='medium'
        onClick={logout}
        className={styles.logoutButton}
        icon={<FiLogOut className={styles.icon} />}
      >
        Sair
      </Button>

      <button
        className={styles.mobileToggle}
        onClick={toggleMenu}
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ''}`}>
        <NavLink
          to='/clients'
          className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}
          onClick={() => setMobileOpen(false)}
        >
          <FiUsers className={styles.icon} /> Clientes
        </NavLink>
        <NavLink
          to='/stats'
          className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}
          onClick={() => setMobileOpen(false)}
        >
          <FiBarChart2 className={styles.icon} /> Estatísticas
        </NavLink>
        <Button
          variant='danger'
          size='medium'
          onClick={() => {
            logout()
            setMobileOpen(false)
          }}
          icon={<FiLogOut className={styles.icon} />}
          className={styles.logoutButton}
        >
          Sair
        </Button>
      </div>
    </nav>
  )
}

export default NavBar
