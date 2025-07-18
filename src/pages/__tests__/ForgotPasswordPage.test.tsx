import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '../ForgotPasswordPage/ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  test('Should render password recovery screen correctly', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/recuperar senha/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar link/i })).toBeInTheDocument();
    expect(screen.getByText(/voltar ao login/i)).toBeInTheDocument();
  });

  test('Should display confirmation message after submitting the form', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/e-mail/i);
    const button = screen.getByRole('button', { name: /enviar link/i });

    fireEvent.change(input, { target: { value: 'email@teste.com' } });
    fireEvent.click(button);

    expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument();
    expect(screen.getByText(/enviamos um link de redefinição para o e-mail/i)).toBeInTheDocument();
    expect(screen.getByText(/email@teste.com/i)).toBeInTheDocument();
  });

  test('Should keep the return link even after sending', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/e-mail/i), {
      target: { value: 'user@email.com' }
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar link/i }));

    expect(screen.getByText(/← voltar ao login/i)).toBeInTheDocument();
  });
});
