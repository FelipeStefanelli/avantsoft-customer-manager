const API_BASE = '/api';

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login falhou');
  const { token } = await res.json();
  return token;
}

export function logout() {
  localStorage.removeItem('toyshop_token');
}
