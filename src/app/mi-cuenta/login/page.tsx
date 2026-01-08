"use client"

import { useUser } from "@/contexts/UserContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { refreshUser } = useUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Usamos NextAuth directamente con el provider "credentials"
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Email o contraseña incorrectos.")
        return
      }

      // Si llegó hasta acá, login ok → refrescamos el user del contexto
      await refreshUser()

      // Y redirigimos a donde quieras
      router.push("/")
    } catch (err) {
      console.error("Error en login:", err)
      setError("Error de red, intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Iniciar sesión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@mail.com"
              />
            </div>
            <div>
              <label className="text-sm">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-2">
              ¿Todavía no tenés cuenta?{" "}
              <Link href="/mi-cuenta/registro" className="underline">
                Registrate acá
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
