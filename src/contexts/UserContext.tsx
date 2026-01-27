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
  esAdmin: boolean // 👈 Mantenemos la propiedad pero la calcularemos
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
        cache: 'no-store' // Evitar cache para ver cambios inmediatos
      })

      if (!res.ok) {
        setUser(null)
        setIsAuthenticated(false)
        return
      }

      const data = await res.json()

      if (data.user) {
        // 🔹 CORRECCIÓN: Inyectamos 'esAdmin' basándonos en el role que viene de la DB
        const u: AppUser = {
          ...data.user,
          esAdmin: data.user.role === "ADMIN"
        }
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
      setUser(null)
      setIsAuthenticated(false)
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
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