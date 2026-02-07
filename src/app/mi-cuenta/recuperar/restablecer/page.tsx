"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

function RestablecerContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            toast.error("Token de recuperación ausente")
            return
        }

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({ token, password }),
                headers: { "Content-Type": "application/json" }
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                toast.success("Contraseña actualizada")
                setTimeout(() => router.push("/mi-cuenta/login"), 3000)
            } else {
                toast.error(data.error || "Error al restablecer")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <Card className="border-none shadow-xl rounded-3xl p-8 text-center bg-white">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#3A4031]">Enlace inválido</h2>
                <p className="text-sm text-[#5B6350] mt-2">Este enlace no contiene un token válido. Por favor, solicitá uno nuevo.</p>
                <Button onClick={() => router.push("/mi-cuenta/recuperar")} className="mt-6 bg-[#4A5D45] rounded-xl uppercase text-[10px] font-bold tracking-widest text-white">Volver a intentar</Button>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden text-left bg-white">
            <CardHeader className="bg-[#4A5D45] text-[#F5F5F0] py-8 text-center">
                <CardTitle className="text-xl font-bold">Nueva Contraseña</CardTitle>
                <p className="text-xs text-[#A3B18A] uppercase tracking-widest mt-2 font-bold">Definí tu clave de acceso</p>
            </CardHeader>

            <CardContent className="p-8">
                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350] flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        className="bg-[#F9F9F7] border-[#E9E9E0] h-12 rounded-xl pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3B18A]"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350]">Confirmar Nueva Contraseña</label>
                                <Input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repetí tu clave"
                                    className="bg-[#F9F9F7] border-[#E9E9E0] h-12 rounded-xl"
                                />
                            </div>
                        </div>

                        <Button disabled={loading} className="w-full bg-[#4A5D45] hover:bg-[#3D4C39] h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest text-white">
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Actualizar Contraseña"}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center py-6 space-y-4">
                        <CheckCircle2 className="w-16 h-16 text-[#A3B18A] mx-auto animate-bounce" />
                        <h3 className="font-bold text-[#3A4031] text-lg">¡Clave restablecida!</h3>
                        <p className="text-sm text-[#5B6350]">
                            Tu contraseña ha sido actualizada correctamente. <br /> Redirigiendo al login...
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function RestablecerClavePage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F5F0] px-4 py-12">
            <div className="w-full max-w-md">
                <Suspense fallback={
                    <div className="flex justify-center"><Loader2 className="animate-spin text-[#4A5D45] w-10 h-10" /></div>
                }>
                    <RestablecerContent />
                </Suspense>
            </div>
        </div>
    )
}