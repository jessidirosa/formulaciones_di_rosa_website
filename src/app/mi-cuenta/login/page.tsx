"use client"

import { useUser } from "@/contexts/UserContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock, Mail, FlaskConical } from "lucide-react"

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
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Las credenciales no coinciden con nuestros registros.")
        return
      }

      await refreshUser()
      router.push("/")
    } catch (err) {
      console.error("Error en login:", err)
      setError("Error de conexión. Por favor, reintente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F5F0] px-4 py-12">
      <div className="w-full max-w-md">

        {/* Branding superior sutil */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4 border border-[#E9E9E0]">
            <FlaskConical className="w-8 h-8 text-[#4A5D45]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A4031] uppercase tracking-wider">Laboratorio Di Rosa</h1>
          <p className="text-sm text-[#A3B18A] font-medium italic mt-1">Acceso a clientes</p>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-[#4A5D45] text-[#F5F5F0] py-8">
            <CardTitle className="text-xl text-center font-bold tracking-tight">
              Iniciar Sesión
            </CardTitle>
            <p className="text-center text-xs text-[#A3B18A] uppercase tracking-widest mt-2 font-bold">
              Bienvenido de nuevo
            </p>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350] flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Correo Electrónico
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350] flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Contraseña
                  </label>
                  <Link
                    href="/mi-cuenta/recuperar" // Cambiado de "#" a una ruta de recuperación
                    className="text-[10px] text-[#A3B18A] hover:text-[#4A5D45] transition-colors font-bold uppercase underline"
                  >
                    ¿Olvidaste tu clave?
                  </Link>
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] h-12 rounded-xl"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium text-center italic">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#4A5D45] hover:bg-[#3D4C39] text-[#F5F5F0] h-12 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/10 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Ingresar al Panel"}
              </Button>

              <div className="pt-6 border-t border-[#F5F5F0] text-center">
                <p className="text-xs text-[#5B6350]">
                  ¿Aún no sos parte de nuestra comunidad? <br className="md:hidden" />
                  <Link href="/mi-cuenta/registro" className="text-[#4A5D45] font-bold hover:underline ml-1">
                    Crea tu cuenta aquí
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer del login */}
        <p className="text-center mt-8 text-[10px] text-[#A3B18A] uppercase tracking-[0.2em] font-medium">
          Formulaciones Magistrales & Naturales
        </p>
      </div>
    </div>
  )
}