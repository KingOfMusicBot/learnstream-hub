import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Admin Check - Fixed for 'profiles' table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id) // Using 'id' instead of 'user_id'
            .single();
          
          setIsAdmin(profile?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // 2. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.role === 'admin');
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username,
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    // Check if input is email or username
    const isEmail = emailOrUsername.includes('@');
    
    if (isEmail) {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });
      return { error };
    } else {
      // Find email by username
      const { data: profile } = await supabase
        .from('profiles')
        .select('email') // Changed to fetch email instead of user_id for login
        .eq('username', emailOrUsername)
        .maybeSingle();

      if (!profile || !profile.email) {
        return { error: new Error('User not found') };
      }

      // Login using the email found
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
