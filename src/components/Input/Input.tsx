import React from 'react'
import styles from './Input.module.scss'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

const Input: React.FC<InputProps> = ({ label, icon, className = '', id, ...props }) => {
  const inputClasses = [
    styles.input,
    icon ? styles.withIcon : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      {icon && <span data-testid='input-icon' className={styles.icon}>{icon}</span>}
      <input
        className={inputClasses}
        id={id}
        {...props}
      />
    </div>
  )
}

export default Input
