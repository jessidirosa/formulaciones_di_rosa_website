"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Terminología alineada a Laboratorio Magistral
const ESTADOS = [
    { value: "pendiente", label: "Pendiente de Pago", color: "text-amber-600 bg-amber-50 border-amber-200" },
    { value: "pagado", label: "Pago Confirmado", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { value: "en_produccion", label: "En Laboratorio (Preparando)", color: "text-[#4A5D45] bg-[#E9E9E0] border-[#A3B18A]" },
    { value: "listo_envio", label: "Listo para Despacho", color: "text-[#4A5D45] bg-white border-[#4A5D45]" },
    { value: "enviado", label: "Pedido Enviado", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { value: "entregado", label: "Pedido Entregado", color: "text-slate-500 bg-slate-50 border-slate-200" },
    { value: "cancelado", label: "Pedido Cancelado", color: "text-red-600 bg-red-50 border-red-200" },
]

interface Props {
    pedidoId: number
    estadoActual: string
}

export default function EstadoPedidoSelect({ pedidoId, estadoActual }: Props) {
    const router = useRouter()
    const [estado, setEstado] = useState(estadoActual || "pendiente")
    const [loading, setLoading] = useState(false)

    // Buscamos el color del estado actual para el estilo del select
    const currentStyle = ESTADOS.find(e => e.value === estado)?.color || "bg-white border-gray-200"

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoEstado = e.target.value
        setEstado(nuevoEstado)
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/pedidos/${pedidoId}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ estado: nuevoEstado }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok || (data && data.ok === false)) {
                toast.error(data.error || "Error en la actualización.")
                return
            }

            toast.success("Estado actualizado correctamente")
            router.refresh()
        } catch (err) {
            toast.error("Error de conexión al servidor.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative inline-block">
            {loading && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#A3B18A]" />
                </div>
            )}
            <select
                className={`
                    appearance-none border rounded-xl px-3 py-1.5 
                    text-[11px] font-bold uppercase tracking-wider 
                    transition-all cursor-pointer focus:ring-2 focus:ring-[#A3B18A] outline-none
                    ${currentStyle}
                    ${loading ? "opacity-50" : "opacity-100"}
                `}
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

            {/* Pequeña flecha decorativa personalizada */}
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    )
}