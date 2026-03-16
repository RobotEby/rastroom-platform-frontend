import React, { createContext, useContext, useEffect, useState } from "react";

// Tipos mockados para substituir as dependências do Supabase
export type AppRole = "admin" | "operator" | "operador" | "montagem" | "supervisor";
export interface User {
  id: string;
  email?: string;
  user_metadata?: unknown;
}
export interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  roles: [],
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async (userId: string) => {
    // Mock de roles
    setRoles(["admin", "operator", "supervisor"]);
  };

  useEffect(() => {
    // Simula verificação de sessão (localStorage, cookie, etc.) — em dev começa deslogado
    setTimeout(() => setLoading(false), 300);
  }, []);

  const signIn = async (_email: string, _password: string) => {
    const mockUser = { id: "user-123", email: _email };
    setSession({ user: mockUser, access_token: "mock-token" });
    setUser(mockUser);
    await fetchRoles(mockUser.id);
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider
      value={{ session, user, roles, loading, signIn, signOut, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};
