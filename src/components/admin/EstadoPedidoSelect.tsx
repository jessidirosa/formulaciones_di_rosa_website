"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const ESTADOS = [
    // ✅ Agregamos el estado de Mercado Pago
    { value: "pendiente_mercadopago", label: "Pago en Proceso (MP)", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { value: "pending_payment_transfer", label: "Esperando Transferencia", color: "text-orange-600 bg-orange-50 border-orange-200" },
    { value: "transfer_proof_sent", label: "Pendiente de Confirmación", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { value: "confirmado", label: "Confirmado / Pago Recibido", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { value: "en_produccion", label: "En Laboratorio", color: "text-[#4A5D45] bg-[#E9E9E0] border-[#A3B18A]" },
    { value: "listo_envio", label: "Listo para Despacho", color: "text-[#4A5D45] bg-white border-[#4A5D45]" },
    { value: "enviado", label: "Pedido Enviado", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { value: "entregado", label: "Pedido Entregado", color: "text-slate-500 bg-slate-50 border-slate-200" },
    { value: "cancelled_expired", label: "Expirado (No pago)", color: "text-red-400 bg-red-50 border-red-100" },
    { value: "cancelado", label: "Anulado / Cancelado", color: "text-red-600 bg-red-50 border-red-200" },
]

interface Props {
    pedidoId: number
    estadoActual: string
}

export default function EstadoPedidoSelect({ pedidoId, estadoActual }: Props) {
    const router = useRouter()
    const [estado, setEstado] = useState(estadoActual || "pending_payment_transfer")
    const [loading, setLoading] = useState(false)

    const currentStyle = ESTADOS.find(e => e.value === estado)?.color || "bg-white border-gray-200"

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoEstado = e.target.value
        setEstado(nuevoEstado)
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/pedidos/${pedidoId}/estado`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado }),
            })

            if (!res.ok) throw new Error("Error en la actualización")

            toast.success("Estado actualizado")
            router.refresh()
        } catch (err) {
            toast.error("Error al conectar con el servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative inline-block">
            {loading && <Loader2 className="absolute -left-6 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#A3B18A]" />}
            <select
                className={`appearance-none border rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer focus:ring-2 focus:ring-[#A3B18A] outline-none ${currentStyle} ${loading ? "opacity-50" : "opacity-100"}`}
                value={estado}
                disabled={loading}
                onChange={handleChange}
            >
                {ESTADOS.map((op) => (
                    <option key={op.value} value={op.value} className="bg-white text-gray-900 font-sans normal-case">
                        {op.label}
                    </option>
                ))}
            </select>
        </div>
    )
}