import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { AuthService } from "../services/AuthService";
import type { RegisterInput, User } from "../models/User";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => User | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authService = useMemo(() => new AuthService(), []);

  useEffect(() => {
    let cancelled = false;
    authService.seedDemoAccount().then(() => {
      if (cancelled) return;
      setUser(authService.getCurrentUser());
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authService]);

  const register = async (input: RegisterInput) => {
    const registered = await authService.register(input);
    setUser(registered);
    return registered;
  };

  const login = async (email: string, password: string) => {
    const loggedIn = await authService.login(email, password);
    setUser(loggedIn);
    return loggedIn;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (patch: Partial<User>) => {
    if (!user) return null;
    const updated = authService.updateUser(user.id, patch);
    if (updated) setUser(updated);
    return updated;
  };

  const value: AuthContextValue = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth mora biti korišćen unutar AuthProvider-a.");
  }
  return context;
}
