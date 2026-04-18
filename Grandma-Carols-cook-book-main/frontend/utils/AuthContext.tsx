import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User { id: number; name: string; profile_photo?: string; }
interface AuthCtx { user: User | null; login: (name: string, code: string) => Promise<void>; logout: () => void; }

const AuthContext = createContext<AuthCtx>({ user: null, login: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('carol_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = async (name: string, code: string) => {
    const res = await api.post('/users', { name, family_code: code });
    setUser(res.data);
    localStorage.setItem('carol_user', JSON.stringify(res.data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('carol_user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
