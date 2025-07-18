export const login = jest.fn(async (email: string, password: string) => {
  if (email === 'usuario@teste.com' && password === 'senha123') {
    return 'fake-token';
  } else {
    throw new Error('Credenciais inválidas');
  }
});

export const logout = jest.fn();
