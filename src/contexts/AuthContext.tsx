import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
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
  pending2FA: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null; requires2FA: boolean }>;
  signup: (email: string, password: string, role: UserRole, displayName: string, country?: string, extra?: { gender?: string; phone?: string; institution_name?: string; sector?: string; school_tenant_id?: string; invite_code?: string }) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  setCurrentChildId: (id: string | null) => void;
  complete2FA: () => void;
}

// Idle timeout constants (ms)
const IDLE_TIMEOUT_PARENT = 30 * 60 * 1000; // 30 minutes
const IDLE_TIMEOUT_ADMIN = 15 * 60 * 1000;  // 15 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchKivaraUser(supabaseUser: SupabaseUser, retries = 3): Promise<KivaraUser | null> {
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
  const [pending2FA, setPending2FA] = useState(false);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setLoading(true);
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, requires2FA: false };

    // Check if user's role requires 2FA (parent, admin)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id);

    const role = roles?.[0]?.role;
    if (role === 'parent' || role === 'admin') {
      // Check for trusted device
      const deviceToken = localStorage.getItem('kivara_trusted_device');
      if (deviceToken) {
        try {
          const { data: trustResult } = await supabase.functions.invoke('verify-2fa', {
            body: { action: 'check-trust', device_token: deviceToken },
          });
          if (trustResult?.trusted) {
            return { error: null, requires2FA: false };
          }
        } catch {
          // Trust check failed — proceed with 2FA
        }
        localStorage.removeItem('kivara_trusted_device');
      }
      setPending2FA(true);
      return { error: null, requires2FA: true };
    }

    return { error: null, requires2FA: false };
  };

  const complete2FA = () => setPending2FA(false);

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
    setPending2FA(false);
  };

  return (
    <AuthContext.Provider value={{
      user: pending2FA ? null : user,
      session,
      loading,
      currentChildId,
      pending2FA,
      login,
      signup,
      logout,
      setCurrentChildId,
      complete2FA,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
