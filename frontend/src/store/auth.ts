import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole =
  | "ADMIN"
  | "LABORATORY"
  | "INTERPRETER"
  | "CLIENT"

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
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, token) => {
        localStorage.setItem('carevo_token', token)
        set({ user, token, isAuthenticated: true, isLoading: false })
      },
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem('carevo_token')
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },
    }),
    {
      name: 'carevo-auth-storage',
      // Only persist user and token, not isLoading
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
