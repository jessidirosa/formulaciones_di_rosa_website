'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ConfirmarPedidoButton({ pedidoId }: { pedidoId: number }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const confirmar = async () => {
        // Log en el navegador para depurar
        console.log("ID recibido en el componente cliente:", pedidoId)

        if (!pedidoId || isNaN(Number(pedidoId))) {
            toast.error("Error: ID de pedido no válido en el cliente")
            return
        }

        try {
            setLoading(true)
            const res = await fetch(`/api/admin/pedidos/${pedidoId}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'confirmado' }),
            })

            const result = await res.json()

            if (!res.ok || !result.ok) {
                throw new Error(result.error || "Error al confirmar el pedido")
            }

            toast.success("Pedido confirmado correctamente")

            router.refresh()
            setTimeout(() => {
                window.location.reload()
            }, 500)

        } catch (e: any) {
            console.error("Error en PATCH:", e)
            toast.error(e?.message || 'Error al conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            disabled={loading}
            onClick={confirmar}
            className={`mt-2 h-9 rounded-xl px-5 font-bold uppercase text-[10px] tracking-[0.15em] transition-all ${loading ? "bg-gray-100 text-gray-400" : "bg-[#4A5D45] text-white hover:bg-[#3A4031]"
                }`}
        >
            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
            {loading ? "Procesando" : "Confirmar Pedido"}
        </Button>
    )
}