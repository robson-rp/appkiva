import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api-client';

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
  session: { token: string } | null;
  loading: boolean;
  currentChildId: string | null;
  pending2FA: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null; requires2FA: boolean }>;
  loginAsChild: (username: string, pin: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, role: UserRole, displayName: string, country?: string, extra?: { gender?: string; phone?: string; institution_name?: string; sector?: string; school_tenant_id?: string; invite_code?: string }) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  setCurrentChildId: (id: string | null) => void;
  complete2FA: () => void;
}

interface ProfileData {
  id: string;           // profile UUID
  user_id: string;      // user UUID
  display_name: string;
  avatar: string | null;
  household_id: string | null;
  tenant_id: string;
  roles: UserRole[];
}

interface LoginResponse {
  token: string;
  refresh_token?: string;
  tenant_id?: string;
  profile: ProfileData;
  requires_2fa?: boolean;
}

interface RegisterResponse {
  data: ProfileData;
  token: string;
  refresh_token?: string;
}

// Idle timeout constants (ms)
const IDLE_TIMEOUT_PARENT = 30 * 60 * 1000; // 30 minutes
const IDLE_TIMEOUT_ADMIN = 15 * 60 * 1000;  // 15 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [user, setUser] = useState<KivaraUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const [pending2FA, setPending2FA] = useState(false);
  const streakRecorded = useRef(false);

  // Auto-record daily activity for streak tracking
  useEffect(() => {
    if (!user?.profileId || streakRecorded.current) return;
    streakRecorded.current = true;
    api.post('/streaks/activity', { profile_id: user.profileId })
      .catch((error) => {
        console.warn('[streak] record_daily_activity:', error.message);
      });
  }, [user?.profileId]);

  // Boot: restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('kivara_token');
    if (token) {
      setLoading(true);
      api.get<{ data: ProfileData }>('/auth/me')
        .then(({ data: profile }) => {
          setSession({ token });
          setUser({
            id: profile.user_id,
            name: profile.display_name,
            role: profile.roles?.[0],
            avatar: profile.avatar || '👤',
            profileId: profile.id,
            householdId: profile.household_id,
          });
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('kivara_token');
          localStorage.removeItem('kivara_refresh_token');
          localStorage.removeItem('kivara_tenant_id');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      
      // Store tokens and tenant ID
      localStorage.setItem('kivara_token', response.token);
      if (response.refresh_token) localStorage.setItem('kivara_refresh_token', response.refresh_token);
      localStorage.setItem('kivara_tenant_id', response.tenant_id ?? response.profile?.tenant_id ?? '');
      
      setSession({ token: response.token });
      
      // Check if 2FA is required
      if (response.requires_2fa) {
        setPending2FA(true);
        
        // Check for trusted device
        const deviceToken = localStorage.getItem('kivara_trusted_device');
        if (deviceToken) {
          try {
            const trustResult = await api.post<{ trusted: boolean }>('/auth/trusted-devices/verify', {
              device_token: deviceToken,
            });
            if (trustResult.trusted) {
              setPending2FA(false);
              setUser({
                id: response.profile.user_id,
                name: response.profile.display_name,
                role: response.profile.roles?.[0],
                avatar: response.profile.avatar || '👤',
                profileId: response.profile.id,
                householdId: response.profile.household_id,
              });
              return { error: null, requires2FA: false };
            }
          } catch {
            // Trust check failed — proceed with 2FA
            localStorage.removeItem('kivara_trusted_device');
          }
        }
        
        // Don't set user yet, wait for 2FA completion
        return { error: null, requires2FA: true };
      }
      
      // No 2FA required, set user immediately
      setUser({
        id: response.profile.user_id,
        name: response.profile.display_name,
        role: response.profile.roles?.[0],
        avatar: response.profile.avatar || '👤',
        profileId: response.profile.id,
        householdId: response.profile.household_id,
      });
      
      return { error: null, requires2FA: false };
    } catch (error: any) {
      return { error: error.message || 'auth.generic_login_error', requires2FA: false };
    }
  };

  const complete2FA = () => setPending2FA(false);

  const loginAsChild = async (username: string, pin: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/child-login', { username, pin });
      
      // Store tokens and tenant ID
      localStorage.setItem('kivara_token', response.token);
      if (response.refresh_token) localStorage.setItem('kivara_refresh_token', response.refresh_token);
      localStorage.setItem('kivara_tenant_id', response.profile?.tenant_id ?? '');
      
      setSession({ token: response.token });
      setUser({
        id: response.profile.user_id,
        name: response.profile.display_name,
        role: response.profile.roles?.[0],
        avatar: response.profile.avatar || '👤',
        profileId: response.profile.id,
        householdId: response.profile.household_id,
      });
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'auth.generic_login_error' };
    }
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
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        display_name: displayName,
        email,
        password,
        role,
        country,
        gender: extra?.gender,
        phone: extra?.phone,
        institution_name: extra?.institution_name,
        sector: extra?.sector,
        school_tenant_id: extra?.school_tenant_id,
        invite_code: extra?.invite_code,
      });
      
      // Store tokens and tenant ID
      localStorage.setItem('kivara_token', response.token);
      if (response.refresh_token) localStorage.setItem('kivara_refresh_token', response.refresh_token);
      localStorage.setItem('kivara_tenant_id', response.data.tenant_id);
      
      setSession({ token: response.token });
      setUser({
        id: response.data.user_id,
        name: response.data.display_name,
        role: response.data.roles?.[0],
        avatar: response.data.avatar || '👤',
        profileId: response.data.id,
        householdId: response.data.household_id,
      });
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      // Ignore errors during logout
      console.warn('Logout error:', error);
    } finally {
      // Always clear local state
      localStorage.removeItem('kivara_token');
      localStorage.removeItem('kivara_refresh_token');
      localStorage.removeItem('kivara_tenant_id');
      setUser(null);
      setSession(null);
      setCurrentChildId(null);
      setPending2FA(false);
    }
  };

  // ── Idle timeout ──
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!user) return;

    const timeout = user.role === 'admin' ? IDLE_TIMEOUT_ADMIN
      : user.role === 'parent' ? IDLE_TIMEOUT_PARENT
      : null;

    if (!timeout) return;

    idleTimerRef.current = setTimeout(() => {
      logout();
    }, timeout);
  }, [user]);

  useEffect(() => {
    if (!user || (user.role !== 'parent' && user.role !== 'admin')) return;

    resetIdleTimer();
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [user, resetIdleTimer]);

  return (
    <AuthContext.Provider value={{
      user: pending2FA ? null : user,
      session,
      loading,
      currentChildId,
      pending2FA,
      login,
      loginAsChild,
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
