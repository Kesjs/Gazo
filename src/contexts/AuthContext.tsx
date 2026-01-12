'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null);
          setLoading(false);

          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            // Handle sign out or token refresh
            if (event === 'SIGNED_OUT') {
              router.push('/auth/signin');
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          // If there's an auth error, sign out the user
          setUser(null);
          setLoading(false);
          if (event !== 'SIGNED_OUT') {
            await supabase.auth.signOut();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const value: AuthContextType = {
    user,
    loading,
    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) =>
      supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
