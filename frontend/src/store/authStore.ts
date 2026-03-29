import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
 _id: string;
 name?: string;
 email: string;
 role: string;
 points?: number;
 issuesResolved?: number;
}

interface AuthState {
 user: User | null;
 token: string | null;
 login: (user: User, token: string) => void;
 logout: () => void;
 isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
 persist(
 (set) => ({
 user: null,
 token: null,
 isAuthenticated: false,
 login: (user, token) => set({ user, token, isAuthenticated: true }),
 logout: () => set({ user: null, token: null, isAuthenticated: false }),
 }),
 {
 name: 'jan-seva-auth',
 }
 )
);
