import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../Input/Input'
import { FiMail } from 'react-icons/fi'

describe('Input', () => {
  it('Should render input with placeholder', () => {
    render(<Input placeholder='Digite seu e-mail' />)
    expect(screen.getByPlaceholderText('Digite seu e-mail')).toBeInTheDocument()
  })

  it('Should render input with label', () => {
    render(<Input id="Email" label='Email' />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('Should call onChange when typed', () => {
    const handleChange = jest.fn()
    render(<Input placeholder='Digite aqui' onChange={handleChange} />)
    const input = screen.getByPlaceholderText('Digite aqui')
    fireEvent.change(input, { target: { value: 'teste' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('Should render input with icon', () => {
    render(<Input icon={<FiMail />} placeholder='Com ícone' />)
    expect(screen.getByTestId('input-icon')).toBeInTheDocument()
  })

  it('Should apply classes correctly', () => {
    const { container } = render(<Input className='meu-estilo' placeholder='Classe extra' />)
    const input = container.querySelector('input')
    expect(input?.className).toMatch(/meu-estilo/)
  })
})
