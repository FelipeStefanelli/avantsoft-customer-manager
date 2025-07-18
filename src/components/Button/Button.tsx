import React from 'react'
import classNames from 'classnames'
import styles from './Button.module.scss'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  icon?: React.ReactElement
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  icon,
  children,
  className,
  ...props
}) => {
  const cls = classNames(
    styles.button,
    styles[variant],
    styles[size],
    className
  )

  return (
    <button className={cls} {...props}>
      {icon && <span data-testid="button-icon" className={styles.icon}>{icon}</span>}
      {children}
    </button>
  )
}

export default Button
