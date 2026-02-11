import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, setAuthToken, getAuthToken, User, Membership } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isMember: boolean;
  membership: Membership | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch {
        setAuthToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: userData } = await authApi.login(email, password);
      setUser(userData);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => {
    try {
      const { user: userData } = await authApi.register({
        email,
        password,
        firstName,
        lastName,
      });
      // Update phone if provided
      if (phone) {
        await authApi.updateProfile({ phone });
      }
      setUser(userData);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch {
      // Ignore error
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isMember = !!user;
  const membership = user?.membership || null;

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isAdmin,
    isMember,
    membership,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
