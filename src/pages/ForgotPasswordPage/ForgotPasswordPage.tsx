import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Brand from '../../assets/avantsoft-brand.png'
import styles from './ForgotPasswordPage.module.scss'

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Chamada de forgot password
            setSent(true)
        } catch {
            toast.error('Não foi possível enviar o e-mail. Tente novamente.')
        }
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <img src={Brand} alt="Brand Avantsoft" className={styles.brand} />
                <h1 className={styles.text}>
                    {sent ? 'Verifique seu e-mail' : 'Recuperar senha'}
                </h1>

                {!sent ? (
                    <>
                        <Input
                            id='passwordEmail'
                            icon={<FiMail />}
                            className={styles.input}
                            placeholder="E-mail"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <Button className={styles.button} type="submit">
                            Enviar link
                        </Button>
                    </>
                ) : (
                    <p className={styles.message}>
                        Enviamos um link de redefinição para o e-mail <strong>{email}</strong>.
                    </p>
                )}

                <div className={styles.bottom}>
                    <Link to="/">← Voltar ao login</Link>
                </div>
            </form>
        </div>
    )
}

export default ForgotPasswordPage
