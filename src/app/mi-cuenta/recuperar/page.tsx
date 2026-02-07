"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, ArrowLeft, FlaskConical, Loader2, CheckCircle2 } from "lucide-react"

export default function RecuperarClavePage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: { "Content-Type": "application/json" }
            })
            if (res.ok) setSent(true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F5F0] px-4">
            <div className="w-full max-w-md">
                <Link href="/mi-cuenta/login" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold text-[#A3B18A] mb-6 hover:text-[#4A5D45] transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Volver al login
                </Link>

                <Card className="border-none shadow-xl rounded-3xl overflow-hidden text-left">
                    <CardHeader className="bg-[#4A5D45] text-[#F5F5F0] py-8 text-center">
                        <CardTitle className="text-xl font-bold">Recuperar Acceso</CardTitle>
                        <p className="text-xs text-[#A3B18A] uppercase tracking-widest mt-2 font-bold">Restablecé tu contraseña</p>
                    </CardHeader>

                    <CardContent className="p-8 bg-white">
                        {!sent ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <p className="text-sm text-[#5B6350] leading-relaxed">
                                    Ingresá el correo electrónico asociado a tu cuenta y te enviaremos las instrucciones para generar una nueva clave.
                                </p>
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
                                        className="bg-[#F9F9F7] border-[#E9E9E0] h-12 rounded-xl"
                                    />
                                </div>
                                <Button disabled={loading} className="w-full bg-[#4A5D45] hover:bg-[#3D4C39] h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Enviar instrucciones"}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-4 space-y-4">
                                <CheckCircle2 className="w-12 h-12 text-[#A3B18A] mx-auto" />
                                <h3 className="font-bold text-[#3A4031]">¡Correo enviado!</h3>
                                <p className="text-sm text-[#5B6350]">
                                    Si el email coincide con una cuenta activa, recibirás un enlace en unos minutos. No olvides revisar la carpeta de Spam.
                                </p>
                                <Link href="/mi-cuenta/login" className="block pt-4">
                                    <Button variant="outline" className="w-full border-[#D6D6C2] rounded-xl text-[#5B6350]">Volver al inicio</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}