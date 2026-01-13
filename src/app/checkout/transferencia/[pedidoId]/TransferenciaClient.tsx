'use client'

import { useEffect, useMemo, useState } from 'react'
import ClearCartOnMount from './ClearCartOnMount'

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
        pending_payment_transfer: 'Pendiente de pago (transferencia)',
        transfer_proof_sent: 'Comprobante enviado (en revisión)',
        confirmado: 'Confirmado',
        pagado: 'Pagado',
        pendiente: 'Pendiente',
        cancelado: 'Cancelado',
        cancelled_expired: 'Cancelado (venció el plazo)',
        enviado: 'Enviado',
        entregado: 'Entregado',
        en_produccion: 'En producción',
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
        titular: process.env.NEXT_PUBLIC_TRANSFER_TITULAR || 'Formulaciones Di Rosa',
        banco: process.env.NEXT_PUBLIC_TRANSFER_BANCO || 'Banco',
        cbu: process.env.NEXT_PUBLIC_TRANSFER_CBU || '0000000000000000000000',
        alias: process.env.NEXT_PUBLIC_TRANSFER_ALIAS || 'ALIAS.EJEMPLO',
        cuit: process.env.NEXT_PUBLIC_TRANSFER_CUIT || '00-00000000-0',
    }

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            alert('Copiado ✅')
        } catch {
            alert('No se pudo copiar 😅')
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
            try {
                await loadPedido()
            } catch (e: any) {
                setError(e?.message || 'Error')
            } finally {
                setLoading(false)
            }
        }
        run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoId])

    const isStandBy = (pedido?.estado || '').toLowerCase() === 'transfer_proof_sent'

    const countdownText = useMemo(() => {
        if (!pedido?.expiresAt) return null

        // si ya avisó, queda en “stand by”
        if (isStandBy) return null

        const expires = new Date(pedido.expiresAt).getTime()
        const diff = expires - now

        if (diff <= 0) return 'Tiempo agotado. Si ya pagaste, tocá “Ya transferí / Envié comprobante”.'

        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        return `Tiempo restante: ${mins}m ${secs}s`
    }, [pedido?.expiresAt, isStandBy, now])

    const handleYaTransferi = async () => {
        try {
            setSending(true)
            setError('')

            // ✅ ESTA es la ruta correcta
            const res = await fetch(`/api/pedidos/${pedidoId}/ya-abone`, {
                method: 'POST',
                credentials: 'include',
            })
            const json = await res.json()

            if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo enviar el aviso')

            setSentOk(true)
            await loadPedido()
        } catch (e: any) {
            setError(e?.message || 'Error')
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return <div className="min-h-[70vh] px-4 py-10 text-center text-gray-600">Cargando datos del pedido…</div>
    }

    if (error) {
        return <div className="min-h-[70vh] px-4 py-10 text-center text-red-600">Error: {error}</div>
    }

    return (
        <div className="min-h-[70vh] bg-white text-gray-900 px-4 py-10">
            <ClearCartOnMount />

            <div className="container mx-auto max-w-2xl">
                <h1 className="text-2xl font-bold mb-2">Transferencia bancaria ✅</h1>

                <p className="text-gray-600 mb-4">
                    Tu pedido <span className="font-semibold">#{pedidoId}</span> quedó reservado.
                </p>

                {countdownText && (
                    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                        <p className="font-medium">Tenés 1 hora para pagar</p>
                        <p className="text-sm">{countdownText}</p>
                    </div>
                )}

                {isStandBy && (
                    <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                        <p className="font-medium">✅ Aviso recibido</p>
                        <p className="text-sm">Ya registramos que enviaste el comprobante. Ahora lo revisamos y confirmamos el pedido.</p>
                    </div>
                )}

                <div className="border rounded-lg p-5 bg-white mb-6">
                    <h2 className="font-semibold text-lg mb-2">Monto a transferir</h2>
                    <div className="text-3xl font-bold text-rose-600">{formatARS(pedido?.total || 0)}</div>

                    {pedido && pedido.descuento > 0 && (
                        <p className="text-sm text-green-700 mt-2">Descuento aplicado: {formatARS(pedido.descuento)}</p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        Estado actual: <span className="font-medium">{prettyEstado(pedido?.estado)}</span>
                    </p>
                </div>

                <div className="border rounded-lg p-5 space-y-2 bg-white">
                    <h2 className="font-semibold text-lg mb-2">Datos para transferir</h2>

                    <p><span className="font-medium">Titular:</span> {datos.titular}</p>
                    <p><span className="font-medium">Banco:</span> {datos.banco}</p>

                    <div className="flex items-center justify-between gap-3">
                        <p className="break-all"><span className="font-medium">CBU:</span> {datos.cbu}</p>
                        <button type="button" className="text-rose-600 hover:underline whitespace-nowrap" onClick={() => handleCopy(datos.cbu)}>
                            Copiar
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <p><span className="font-medium">Alias:</span> {datos.alias}</p>
                        <button type="button" className="text-rose-600 hover:underline whitespace-nowrap" onClick={() => handleCopy(datos.alias)}>
                            Copiar
                        </button>
                    </div>

                    <p><span className="font-medium">CUIT:</span> {datos.cuit}</p>

                    <p className="text-sm text-gray-500 mt-3">
                        Importante: Envianos el comprobante vía WhatsApp. En el concepto/nota colocá tu número de pedido #{pedidoId}.
                    </p>
                </div>

                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">¿Ya transferiste?</p>
                    <p className="text-sm text-gray-700 mt-1">
                        Tocá este botón para avisarnos. Así tu pedido queda <b>en revisión</b> y no se cancela automáticamente.
                    </p>

                    <button
                        type="button"
                        onClick={handleYaTransferi}
                        disabled={sending || sentOk || isStandBy}
                        className="mt-3 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-white font-semibold disabled:opacity-60"
                    >
                        {isStandBy || sentOk ? 'Aviso enviado ✅' : sending ? 'Enviando...' : 'Ya transferí / Envié comprobante'}
                    </button>
                </div>

                <div className="mt-6 flex gap-4">
                    <a href="/mi-cuenta" className="text-rose-600 hover:underline">Ver mis pedidos</a>
                    <a href="/" className="text-rose-600 hover:underline">Volver al inicio</a>
                </div>
            </div>
        </div>
    )
}
