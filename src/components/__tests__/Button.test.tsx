import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button/Button';
import { FiUser } from 'react-icons/fi';

describe('Button', () => {
  it('Should render button with the provided text', () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('Should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Should render button with ícon', () => {
    render(<Button icon={<FiUser />}>Perfil</Button>);
    expect(screen.getByRole('button')).toContainElement(screen.getByText('Perfil'));
    expect(screen.getByTestId('button-icon')).toBeInTheDocument();
  });

  it('Should apply the correct classes for variants and sizes', () => {
    const { container } = render(<Button variant='danger' size='large'>Excluir</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toMatch(/danger/);
    expect(button?.className).toMatch(/large/);
  });
});
