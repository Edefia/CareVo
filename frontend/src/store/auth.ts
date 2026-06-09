import { create } from "zustand"

export type UserRole =
  | "SUPER_ADMIN"
  | "PLATFORM_ADMIN"
  | "LAB_ADMIN"
  | "LAB_STAFF"
  | "INTERPRETER"
  | "HEALTH_ADVOCATE"
  | "REFERRAL_PARTNER"
  | "PATIENT"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  laboratoryId?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}))
