import { useState, type ReactNode } from 'react';
import { api } from '../services/api';
import { AuthContext } from './AuthContext';
import type { LoginResponse, LoginCredentials, User } from '../types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storagedUser = localStorage.getItem('@Lawfy:user');
    const storagedToken = localStorage.getItem('@Lawfy:token');

    if (storagedUser && storagedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
      return JSON.parse(storagedUser);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

async function signIn({ email, password }: LoginCredentials) {
  setLoading(true);
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const { token, usuario } = response.data;

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('@Lawfy:token', token);
    localStorage.setItem('@Lawfy:user', JSON.stringify(usuario));
    setUser(usuario);
  } finally {
    setLoading(false);
  }
}
  function signOut() {
    localStorage.removeItem('@Lawfy:token');
    localStorage.removeItem('@Lawfy:user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}