'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Ticket,
    ArrowLeft,
    Loader2,
    Sparkles,
    Calendar as CalendarIcon,
    Info
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NuevoCuponPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Estado del formulario
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        tipo: 'PORCENTAJE',
        valor: '',
        montoMinimo: '',
        limiteUsos: '',
        fechaVencimiento: ''
    })

    const handleGenerateCode = () => {
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        setFormData({ ...formData, codigo: `PROMO-${randomCode}` })
        toast.info("Código aleatorio generado")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/admin/cupones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    valor: Number(formData.valor),
                    montoMinimo: formData.montoMinimo ? Number(formData.montoMinimo) : null,
                    limiteUsos: formData.limiteUsos ? Number(formData.limiteUsos) : null,
                    fechaVencimiento: formData.fechaVencimiento || null
                })
            })

            const result = await res.json()

            if (res.ok) {
                toast.success("Cupón creado exitosamente")
                router.push('/admin/cupones')
                router.refresh()
            } else {
                toast.error(result.error || "Error al crear el cupón")
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6 text-left">
            <Link
                href="/admin/cupones"
                className="flex items-center gap-2 text-[10px] uppercase font-bold text-[#A3B18A] hover:text-[#4A5D45] transition-colors w-fit"
            >
                <ArrowLeft className="w-3 h-3" /> Volver a la lista
            </Link>

            <div className="flex items-center gap-3">
                <div className="bg-[#4A5D45] p-3 rounded-2xl text-white shadow-lg shadow-emerald-900/20">
                    <Ticket className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Crear Cupón</h1>
                    <p className="text-gray-500 text-sm">Configurá un nuevo beneficio para tus clientes.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* BLOQUE IZQUIERDO: Datos Principales */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border-[#E9E9E0] shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#A3B18A]">Identificación</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4A5D45]">Código del Cupón</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            required
                                            placeholder="EJ: VERANO2026"
                                            value={formData.codigo}
                                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                                            className="rounded-xl border-[#E9E9E0] font-mono font-bold tracking-widest"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleGenerateCode}
                                            className="rounded-xl border-[#A3B18A] text-[#4A5D45]"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4A5D45]">Descripción (Interno)</Label>
                                    <Input
                                        placeholder="Ej: Promo para Instagram"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="rounded-xl border-[#E9E9E0]"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-[#E9E9E0] shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#A3B18A]">Valor del Beneficio</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-[#4A5D45]">Tipo</Label>
                                        <Select
                                            value={formData.tipo}
                                            onValueChange={(val) => setFormData({ ...formData, tipo: val })}
                                        >
                                            <SelectTrigger className="rounded-xl border-[#E9E9E0]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
                                                <SelectItem value="MONTO_FIJO">Monto Fijo ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-[#4A5D45]">Valor</Label>
                                        <Input
                                            required
                                            type="number"
                                            placeholder={formData.tipo === 'PORCENTAJE' ? '15' : '5000'}
                                            value={formData.valor}
                                            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                            className="rounded-xl border-[#E9E9E0]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* BLOQUE DERECHO: Restricciones */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border-[#E9E9E0] shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#A3B18A]">Restricciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4A5D45]">Compra Mínima ($)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Opcional"
                                        value={formData.montoMinimo}
                                        onChange={(e) => setFormData({ ...formData, montoMinimo: e.target.value })}
                                        className="rounded-xl border-[#E9E9E0]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4A5D45]">Límite total de usos</Label>
                                    <Input
                                        type="number"
                                        placeholder="Sin límite"
                                        value={formData.limiteUsos}
                                        onChange={(e) => setFormData({ ...formData, limiteUsos: e.target.value })}
                                        className="rounded-xl border-[#E9E9E0]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4A5D45]">Fecha de Vencimiento</Label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B18A]" />
                                        <Input
                                            type="date"
                                            value={formData.fechaVencimiento}
                                            onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                                            className="rounded-xl border-[#E9E9E0] pl-10"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 italic">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                El cupón se activará inmediatamente después de ser creado. Podrás desactivarlo en cualquier momento desde la lista general.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#4A5D45] hover:bg-[#3A4031] text-white h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-900/10 transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cupón"}
                        </Button>
                    </div>

                </div>
            </form>
        </div>
    )
}