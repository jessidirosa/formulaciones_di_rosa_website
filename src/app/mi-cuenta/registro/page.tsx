"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, Mail, Lock, FlaskConical, CheckCircle2 } from "lucide-react"

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, apellido, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Ocurrió un error al registrarte.")
        return
      }

      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (loginResult?.error) {
        router.push("/mi-cuenta/login")
        return
      }

      router.push("/mi-cuenta")
    } catch (err) {
      console.error(err)
      setError("Error de red, intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-[#F5F5F0] px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Cabecera de Marca */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4 border border-[#E9E9E0]">
            <FlaskConical className="w-8 h-8 text-[#4A5D45]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A4031] uppercase tracking-wider">Laboratorio Di Rosa</h1>
          <p className="text-sm text-[#A3B18A] font-medium italic mt-1">Crear Nueva Cuenta</p>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-[#4A5D45] text-[#F5F5F0] py-8 px-8">
            <CardTitle className="text-xl text-center font-bold tracking-tight">
              Unite a la comunidad
            </CardTitle>
            <div className="flex justify-center gap-4 mt-4 overflow-x-auto no-scrollbar">
              <span className="flex items-center gap-1 text-[10px] text-[#A3B18A] uppercase font-bold whitespace-nowrap"><CheckCircle2 className="w-3 h-3" /> Productos personalizados</span>
              <span className="flex items-center gap-1 text-[10px] text-[#A3B18A] uppercase font-bold whitespace-nowrap"><CheckCircle2 className="w-3 h-3" /> Cruelty Free</span>
              <span className="flex items-center gap-1 text-[10px] text-[#A3B18A] uppercase font-bold whitespace-nowrap"><CheckCircle2 className="w-3 h-3" /> Envíos a todo el país</span>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <form className="space-y-5" onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350] flex items-center gap-2">
                    <User className="w-3 h-3" /> Nombre
                  </label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Ana"
                    className="bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350] flex items-center gap-2">
                    <User className="w-3 h-3" /> Apellido
                  </label>
                  <Input
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej: García"
                    className="bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350] flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Correo Electrónico
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@correo.com"
                  className="bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350] flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Contraseña
                </label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] h-11 rounded-xl"
                />
                <p className="text-[9px] text-[#A3B18A] font-medium italic italic">Mínimo 8 caracteres sugeridos.</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium text-center italic">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#4A5D45] hover:bg-[#3D4C39] text-[#F5F5F0] h-12 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/10 transition-all mt-4"
                disabled={loading}
              >
                {loading ? "Generando Paciente..." : "Confirmar Registro"}
              </Button>

              <div className="pt-6 border-t border-[#F5F5F0] text-center">
                <p className="text-xs text-[#5B6350]">
                  ¿Ya tenés una cuenta? <br className="md:hidden" />
                  <Link href="/mi-cuenta/login" className="text-[#4A5D45] font-bold hover:underline ml-1">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-[10px] text-[#A3B18A] uppercase tracking-[0.2em] font-medium">
          Tratamientos Personalizados & Experiencia Profesional
        </p>
      </div>
    </div>
  )
}