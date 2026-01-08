"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const ESTADOS = [
    { value: "pendiente", label: "Pendiente" },
    { value: "pagado", label: "Pagado (pago confirmado)" },
    { value: "en_produccion", label: "En producción" },
    { value: "listo_envio", label: "Listo para envío / retiro" },
    { value: "enviado", label: "Enviado" },
    { value: "entregado", label: "Entregado" },
    { value: "cancelado", label: "Cancelado" },
]

interface Props {
    pedidoId: number
    estadoActual: string
}

export default function EstadoPedidoSelect({ pedidoId, estadoActual }: Props) {
    const router = useRouter()
    const [estado, setEstado] = useState(estadoActual || "pendiente")
    const [loading, setLoading] = useState(false)

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
                console.error("Error al actualizar estado:", data)
                toast.error(data.error || "No se pudo actualizar el estado.")
                return
            }

            toast.success("Estado actualizado ✔️")
            router.refresh()
        } catch (err) {
            console.error("Error de red al actualizar estado:", err)
            toast.error("Error de red al actualizar el estado.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <select
            className="border rounded-md px-2 py-1 text-xs sm:text-sm bg-white"
            value={estado}
            disabled={loading}
            onChange={handleChange}
        >
            {ESTADOS.map((op) => (
                <option key={op.value} value={op.value}>
                    {op.label}
                </option>
            ))}
        </select>
    )
}
