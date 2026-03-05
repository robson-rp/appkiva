import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/kivara';

interface AuthContextType {
  user: User | null;
  currentChildId: string | null;
  login: (role: UserRole, identifier?: string) => void;
  logout: () => void;
  setCurrentChildId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockParent: User = {
  id: 'parent-1',
  name: 'Maria Silva',
  email: 'maria@example.com',
  role: 'parent',
  avatar: '👩',
  familyId: 'family-1',
};

const mockChildUser: User = {
  id: 'child-1',
  name: 'Ana',
  role: 'child',
  avatar: '🦊',
  familyId: 'family-1',
};

const mockTeacherUser: User = {
  id: 'teacher-1',
  name: 'Prof. Carlos Mendes',
  email: 'carlos@escola.mz',
  role: 'teacher',
  avatar: '👨‍🏫',
  familyId: 'school-1',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);

  const login = (role: UserRole) => {
    if (role === 'parent') {
      setUser(mockParent);
    } else if (role === 'teacher') {
      setUser(mockTeacherUser);
    } else {
      setUser(mockChildUser);
      setCurrentChildId('child-1');
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentChildId(null);
  };

  return (
    <AuthContext.Provider value={{ user, currentChildId, login, logout, setCurrentChildId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
