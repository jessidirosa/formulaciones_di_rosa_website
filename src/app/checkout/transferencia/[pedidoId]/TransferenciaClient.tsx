'use client'

import { useEffect, useMemo, useState } from 'react'
import ClearCartOnMount from './ClearCartOnMount'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// IMPORTANTE: Verifica estas tres líneas
import { Separator } from '@/components/ui/separator'
import {
    Copy,
    CheckCircle2,
    Clock,
    AlertCircle,
    Landmark,
    ChevronRight,
    ClipboardCheck,
    FlaskConical,
    Loader2 // Asegúrate de que Loader2 esté aquí
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link' // Añadido para los enlaces del final
type Pedido = {
    id: number
    total: number
    descuento: number
    estado: string
    expiresAt?: string | null
}

function formatARS(n: number) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
    }).format(n)
}

function prettyEstado(estado?: string | null) {
    const e = (estado || '').toLowerCase()
    const map: Record<string, string> = {
        pending_payment_transfer: 'Pendiente de transferencia',
        transfer_proof_sent: 'Comprobante en revisión',
        confirmado: 'Confirmado',
        pagado: 'Pago Acreditado',
        pendiente: 'Pendiente',
        cancelado: 'Cancelado',
        cancelled_expired: 'Expirado',
        enviado: 'Despachado',
        entregado: 'Entregado',
        en_produccion: 'En Laboratorio',
        listo_envio: 'Listo para envío',
        listo_retiro: 'Listo para retiro',
    }
    return map[e] || 'En proceso'
}

export default function TransferenciaClient({ pedidoId }: { pedidoId: string }) {
    const [pedido, setPedido] = useState<Pedido | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [now, setNow] = useState(Date.now())
    const [sending, setSending] = useState(false)
    const [sentOk, setSentOk] = useState(false)

    const datos = {
        titular: process.env.NEXT_PUBLIC_TRANSFER_TITULAR || 'Laboratorio Di Rosa',
        banco: process.env.NEXT_PUBLIC_TRANSFER_BANCO || 'Banco Santander',
        cbu: process.env.NEXT_PUBLIC_TRANSFER_CBU || '0000000000000000000000',
        alias: process.env.NEXT_PUBLIC_TRANSFER_ALIAS || 'DIROSA.MAGISTRAL',
        cuit: process.env.NEXT_PUBLIC_TRANSFER_CUIT || '30-12345678-9',
    }

    const handleCopy = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(`${label} copiado al portapapeles`)
        } catch {
            toast.error('No se pudo copiar')
        }
    }

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(t)
    }, [])

    const loadPedido = async () => {
        const res = await fetch(`/api/pedidos/${pedidoId}`, { credentials: 'include' })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo cargar el pedido')
        setPedido(json.pedido)
    }

    useEffect(() => {
        const run = async () => {
            try { await loadPedido() }
            catch (e: any) { setError(e?.message || 'Error') }
            finally { setLoading(false) }
        }
        run()
    }, [pedidoId])

    const isStandBy = (pedido?.estado || '').toLowerCase() === 'transfer_proof_sent'

    const countdownText = useMemo(() => {
        if (!pedido?.expiresAt || isStandBy) return null
        const expires = new Date(pedido.expiresAt).getTime()
        const diff = expires - now
        if (diff <= 0) return 'Plazo vencido'
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        return `${mins}m ${secs}s`
    }, [pedido?.expiresAt, isStandBy, now])

    const handleYaTransferi = async () => {
        try {
            setSending(true)
            const res = await fetch(`/api/pedidos/${pedidoId}/ya-abone`, {
                method: 'POST',
                credentials: 'include',
            })
            if (!res.ok) throw new Error('Error al enviar el aviso')
            setSentOk(true)
            toast.success("Aviso enviado. Revisaremos tu pago a la brevedad.")
            await loadPedido()
        } catch (e: any) {
            toast.error(e?.message || 'Error')
        } finally {
            setSending(false)
        }
    }

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F5F5F0]">
            <FlaskConical className="w-12 h-12 text-[#4A5D45] animate-pulse mb-4" />
            <p className="text-[#5B6350] font-bold uppercase tracking-widest text-xs">Validando Pedido...</p>
        </div>
    )

    if (error) return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F5F0] px-4">
            <Card className="max-w-md border-red-100 shadow-xl rounded-3xl overflow-hidden">
                <div className="p-8 text-center space-y-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold text-[#3A4031]">Hubo un inconveniente</h2>
                    <p className="text-sm text-[#5B6350]">{error}</p>
                    <Button onClick={() => window.location.reload()} className="bg-[#4A5D45] text-white rounded-xl uppercase font-bold text-xs tracking-widest">Reintentar</Button>
                </div>
            </Card>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F5F5F0] py-12 px-4">
            <ClearCartOnMount />
            <div className="container mx-auto max-w-2xl space-y-6">

                {/* Cabecera de Confirmación */}
                <div className="text-center space-y-3 mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-2 border border-[#E9E9E0]">
                        <CheckCircle2 className="w-10 h-10 text-[#4A5D45]" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-[#3A4031]">¡Reserva Exitosa!</h1>
                    <p className="text-[#5B6350] uppercase tracking-[0.2em] text-[10px] font-bold">Pedido #{pedidoId}</p>
                </div>

                {/* Status Cards */}
                {countdownText && (
                    <div className="bg-[#4A5D45] text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-900/10">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-[#A3B18A]" />
                            <span className="text-xs uppercase font-bold tracking-widest">Plazo para transferir</span>
                        </div>
                        <span className="font-mono text-xl font-bold">{countdownText}</span>
                    </div>
                )}

                {isStandBy && (
                    <div className="bg-[#E9E9E0] border border-[#A3B18A] text-[#4A5D45] rounded-2xl p-5 flex items-start gap-4 animate-in fade-in zoom-in duration-500">
                        <ClipboardCheck className="w-6 h-6 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-sm uppercase tracking-wider">Aviso de pago recibido</p>
                            <p className="text-xs opacity-80 mt-1 italic">Estamos verificando tu comprobante en el sistema bancario. Te avisaremos por email.</p>
                        </div>
                    </div>
                )}

                {/* Monto Central */}
                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                    <div className="p-8 text-center border-b border-[#F5F5F0]">
                        <p className="text-[10px] uppercase tracking-widest text-[#A3B18A] font-bold mb-2">Total Neto a Transferir</p>
                        <div className="text-5xl font-serif font-bold text-[#4A5D45]">
                            {formatARS(pedido?.total || 0)}
                        </div>
                        {pedido && pedido.descuento > 0 && (
                            <Badge variant="outline" className="mt-4 border-[#A3B18A] text-[#4A5D45] font-bold text-[10px] uppercase px-3 py-1">
                                Descuento Transferencia Aplicado
                            </Badge>
                        )}
                    </div>

                    {/* Datos Bancarios */}
                    <div className="p-8 space-y-5">
                        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5B6350] border-b border-[#F5F5F0] pb-2">Datos de la Cuenta</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] text-[#A3B18A] font-bold uppercase">Titular</span>
                                <p className="text-[#3A4031] font-semibold">{datos.titular}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-[#A3B18A] font-bold uppercase">Banco</span>
                                <p className="text-[#3A4031] font-semibold">{datos.banco}</p>
                            </div>
                        </div>

                        <Separator className="bg-[#F5F5F0]" />

                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <span className="text-[10px] text-[#A3B18A] font-bold uppercase">CBU</span>
                                <div className="flex items-center justify-between bg-[#F9F9F7] p-3 rounded-xl border border-[#E9E9E0]">
                                    <code className="text-[#3A4031] font-mono text-sm break-all">{datos.cbu}</code>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(datos.cbu, 'CBU')} className="text-[#4A5D45] hover:bg-white"><Copy className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <span className="text-[10px] text-[#A3B18A] font-bold uppercase">Alias</span>
                                <div className="flex items-center justify-between bg-[#F9F9F7] p-3 rounded-xl border border-[#E9E9E0]">
                                    <code className="text-[#3A4031] font-mono text-base font-bold">{datos.alias}</code>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(datos.alias, 'Alias')} className="text-[#4A5D45] hover:bg-white"><Copy className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-[10px] text-[#A3B18A] italic">
                                * Por favor, incluí el número <b>#{pedidoId}</b> en el concepto de la transferencia.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Acción Final */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-[#E9E9E0] text-center space-y-4">
                    <p className="text-xs text-[#5B6350] leading-relaxed font-medium">
                        ¿Ya realizaste el pago? Avisanos para procesar tu orden y comenzar con la preparación magistral.
                    </p>
                    <Button
                        onClick={handleYaTransferi}
                        disabled={sending || sentOk || isStandBy}
                        className="w-full bg-[#4A5D45] hover:bg-[#3D4C39] text-white h-14 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs transition-all shadow-xl shadow-emerald-900/10"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {isStandBy || sentOk ? 'Aviso enviado correctamente' : 'Confirmar Envío de Pago'}
                    </Button>
                </div>

                {/* Footer Links */}
                <div className="flex justify-center gap-8 pt-4">
                    <a href="/mi-cuenta" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#A3B18A] hover:text-[#4A5D45] transition-colors">
                        Mis Pedidos <ChevronRight className="w-3 h-3" />
                    </a>
                    <a href="/" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#A3B18A] hover:text-[#4A5D45] transition-colors">
                        Volver a la Tienda <ChevronRight className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    )
}