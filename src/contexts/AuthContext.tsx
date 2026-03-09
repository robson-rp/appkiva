import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export type UserRole = 'parent' | 'child' | 'teen' | 'teacher' | 'admin' | 'partner';

export interface KivaraUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar: string;
  profileId: string;
  householdId: string | null;
}

interface AuthContextType {
  user: KivaraUser | null;
  session: Session | null;
  loading: boolean;
  currentChildId: string | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, role: UserRole, displayName: string, country?: string, extra?: { gender?: string; phone?: string; institution_name?: string; sector?: string; school_tenant_id?: string; invite_code?: string }) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  setCurrentChildId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchKivaraUser(supabaseUser: SupabaseUser, retries = 3): Promise<KivaraUser | null> {
  // Fetch profile (with retry for race condition when trigger hasn't created it yet)
  let profile: { id: string; display_name: string; avatar: string | null; household_id: string | null } | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, household_id')
      .eq('user_id', supabaseUser.id)
      .single();
    
    if (data) {
      profile = data;
      break;
    }

    if (attempt < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!profile) return null;

  // Fetch role
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id);

  const role = (roles?.[0]?.role as UserRole) ?? 'child';

  return {
    id: supabaseUser.id,
    name: profile.display_name,
    email: supabaseUser.email,
    role,
    avatar: profile.avatar ?? '👤',
    profileId: profile.id,
    householdId: profile.household_id,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<KivaraUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const streakRecorded = useRef(false);

  // Auto-record daily activity for streak tracking
  useEffect(() => {
    if (!user?.profileId || streakRecorded.current) return;
    streakRecorded.current = true;
    supabase
      .rpc('record_daily_activity', { _profile_id: user.profileId })
      .then(({ error }) => {
        if (error) console.warn('[streak] record_daily_activity:', error.message);
      });
  }, [user?.profileId]);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setLoading(true);
          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(async () => {
            const kivaraUser = await fetchKivaraUser(newSession.user);
            setUser(kivaraUser);
            setLoading(false);
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchKivaraUser(existingSession.user).then(kivaraUser => {
          setUser(kivaraUser);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    displayName: string,
    country: string = 'AO',
    extra?: {
      gender?: string;
      phone?: string;
      institution_name?: string;
      sector?: string;
      school_tenant_id?: string;
      invite_code?: string;
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role,
          country,
          avatar: role === 'parent' ? '👩' : role === 'teacher' ? '👨‍🏫' : role === 'teen' ? '🧑‍💻' : role === 'admin' ? '🛡️' : role === 'partner' ? '🏢' : '🦊',
          gender: extra?.gender,
          phone: extra?.phone,
          institution_name: extra?.institution_name,
          sector: extra?.sector,
          school_tenant_id: extra?.school_tenant_id,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };

    // If child/teen with invite code, claim it after signup
    if (extra?.invite_code && data.user && (role === 'child' || role === 'teen')) {
      // Wait for profile to be created by trigger, then claim
      setTimeout(async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user!.id)
          .single();
        if (profile) {
          await supabase.rpc('claim_invite_code', {
            _code: extra.invite_code!,
            _profile_id: profile.id,
          } as any);
        }
      }, 1000);
    }

    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCurrentChildId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, currentChildId, login, signup, logout, setCurrentChildId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
