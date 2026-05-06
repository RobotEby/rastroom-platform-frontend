import React, { createContext, useContext, useEffect, useState } from "react";
import {
  authApi,
  clearTokens,
  getAccessToken,
  setTokens,
} from "../../../shared/api/client";

export type AppRole =
  | "admin"
  | "operator"
  | "operador"
  | "montagem"
  | "supervisor";
export interface User {
  id: string;
  email?: string;
  full_name?: string;
  roles?: AppRole[];
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
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  roles: [],
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
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

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await authApi.me();
        setUser(me as User);
        setRoles((me.roles || []) as AppRole[]);
        setSession({ user: me as User, access_token: token });
      } catch {
        clearTokens();
        setUser(null);
        setRoles([]);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const applyAuth = (data: {
    user: { id: string; email?: string; full_name?: string; roles: string[] };
    roles: string[];
    access_token: string;
    refresh_token?: string;
  }) => {
    setTokens(data.access_token, data.refresh_token);
    const user: User = {
      ...data.user,
      roles: data.user.roles as AppRole[],
    };
    setSession({ user, access_token: data.access_token });
    setUser(user);
    setRoles(data.roles as AppRole[]);
  };

  const signIn = async (email: string, password: string) => {
    applyAuth(await authApi.login(email, password));
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    applyAuth(await authApi.register(fullName, email, password));
  };

  const signOut = async () => {
    try {
      if (getAccessToken()) await authApi.logout();
    } catch {
      // local logout must still happen if the token already expired
    }
    clearTokens();
    setSession(null);
    setUser(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        roles,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
