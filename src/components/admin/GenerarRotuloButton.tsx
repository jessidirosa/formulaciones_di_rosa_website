'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tag, Loader2, Printer } from 'lucide-react'
import { toast } from 'sonner'

export default function GenerarRotuloButton({ pedidoId }: { pedidoId: number }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const run = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/pedidos/${pedidoId}/shipping/generar-rotulo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            })

            const json = await res.json().catch(() => ({}))

            if (res.ok && (json.ok || json.success)) {
                toast.success("Rótulo generado correctamente")
                router.refresh()
            } else {
                throw new Error(json.error || 'No se pudo generar el rótulo')
            }
        } catch (e: any) {
            console.error('Error al generar rótulo:', e)
            toast.error(e?.message || 'Error al procesar el envío')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={run}
            className={`
                mt-2 h-9 rounded-xl px-5 font-bold uppercase text-[10px] tracking-[0.15em] transition-all
                ${loading
                    ? "bg-[#E9E9E0] text-[#A3B18A] border-[#D6D6C2]"
                    : "bg-white border-[#D6D6C2] text-[#4A5D45] hover:bg-[#F5F5F0] hover:border-[#4A5D45] shadow-sm active:scale-95 border"}
            `}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <Tag className="mr-2 h-3.5 w-3.5" />
                    Generar Rótulo
                </>
            )}
        </Button>
    )
}