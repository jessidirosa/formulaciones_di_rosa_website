'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ConfirmarPedidoButton({ pedidoId }: { pedidoId: number }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const confirmar = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/pedidos/${pedidoId}/confirmar`, {
                method: 'POST',
                credentials: 'include',
            })
            const json = await res.json()
            if (res.ok && json.ok) router.refresh()
            if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo confirmar')

            // ✅ fuerza a re-render del Server Component (admin/pedidos)
            router.refresh()
        } catch (e: any) {
            alert(e?.message || 'Error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={confirmar}
            className="mt-2"
        >
            {loading ? 'Confirmando…' : 'Confirmar'}
        </Button>
    )
}
