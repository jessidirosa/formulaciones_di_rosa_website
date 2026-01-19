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
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/pedidos/${pedidoId}/confirmar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            })

            const json = await res.json().catch(() => ({}))

            if (res.ok && (json.ok || json.success)) {
                toast.success("Pedido confirmado correctamente")
                router.refresh()
            } else {
                throw new Error(json.error || 'No se pudo confirmar el pedido')
            }
        } catch (e: any) {
            console.error('Error al confirmar:', e)
            toast.error(e?.message || 'Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={confirmar}
            className={`
                mt-2 h-9 rounded-xl px-5 font-bold uppercase text-[10px] tracking-[0.15em] transition-all
                ${loading
                    ? "bg-[#E9E9E0] text-[#A3B18A]"
                    : "bg-[#4A5D45] text-white hover:bg-[#3A4031] shadow-sm hover:shadow-md active:scale-95"}
            `}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Procesando
                </>
            ) : (
                <>
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                    Confirmar Pedido
                </>
            )}
        </Button>
    )
}