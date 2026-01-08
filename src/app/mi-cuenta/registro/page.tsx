"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RegistroPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [apellido, setApellido] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 1) Crear usuario
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, apellido, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Mostrar mensaje de la API (409, 400, 500...)
        setError(data.error || "Ocurrió un error al registrarte.")
        return
      }

      // 2) Login automático con NextAuth (credentials)
      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (loginResult?.error) {
        // Si por algún motivo no se puede loguear, lo mando al login
        router.push("/mi-cuenta/login")
        return
      }

      // 3) Todo ok → a Mi Cuenta
      router.push("/mi-cuenta")
    } catch (err) {
      console.error(err)
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
            Crear cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm">Nombre</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-sm">Apellido</label>
              <Input
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Tu apellido"
              />
            </div>
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
              {loading ? "Creando cuenta..." : "Registrarme"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
