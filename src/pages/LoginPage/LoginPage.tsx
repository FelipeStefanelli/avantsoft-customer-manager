import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Brand from '../../assets/avantsoft-brand.png'
import styles from './LoginPage.module.scss'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/clients')
    } catch {
      toast.error('As credenciais fornecidas não foram encontradas.')
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <img className={styles.brand} src={Brand} alt="Brand Avantsoft" />

        <h1 className={styles.text}>Seja bem-vindo!</h1>
        <Input
          id='loginEmail'
          icon={<FiMail />}
          className={styles.input}
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <Input
          id='loginPassword'
          icon={<FiLock />}
          className={styles.input}
          placeholder="Senha"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <div className={styles.forgot}>
          <Link to="/forgot-password">Esqueci minha senha?</Link>
        </div>

        <Button className={styles.button} type="submit">
          Entrar
        </Button>
      </form>
    </div>
  )
}

export default LoginPage
