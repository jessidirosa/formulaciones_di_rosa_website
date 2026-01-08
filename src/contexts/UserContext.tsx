"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { signOut } from "next-auth/react"

type AppUser = {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  role: string
  esAdmin: boolean
  creadoEn?: string
}

type UserContextValue = {
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (!res.ok) {
        setUser(null)
        setIsAuthenticated(false)
        return
      }

      const data = await res.json()
      const u: AppUser | null = data.user ?? null

      if (u) {
        setUser(u)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error("Error cargando /api/auth/me:", err)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  const logout = async () => {
    try {
      await signOut({ redirect: false })
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        refreshUser: fetchMe,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useUser debe usarse dentro de <UserProvider>")
  }
  return ctx
}
