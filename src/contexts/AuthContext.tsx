import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextValue {
  token: string | null;
  loading: boolean;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextValue>({ token: null, loading: true, setToken: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [loading] = useState(false);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_token') setToken(e.newValue);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ token, loading, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);