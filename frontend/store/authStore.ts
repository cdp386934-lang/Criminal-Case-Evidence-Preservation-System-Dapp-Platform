import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id?: string
  id?: string
  name: string
  email: string
  role: 'police' | 'judge' | 'prosecutor' | 'lawyer'|'admin'
  walletAddress?: string
  avatar?: string
  phone:string
  address:string
  
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token })
        if (token) {
          localStorage.setItem('token', token)
        } else {
          localStorage.removeItem('token')
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
