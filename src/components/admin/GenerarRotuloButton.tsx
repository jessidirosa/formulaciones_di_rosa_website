'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function GenerarRotuloButton({ pedidoId }: { pedidoId: number }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const run = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/pedidos/${pedidoId}/shipping/generar-rotulo`, {
                method: 'POST',
                credentials: 'include',
            })
            const json = await res.json()
            if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo generar el rótulo')
            router.refresh()
        } catch (e: any) {
            alert(e?.message || 'Error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button type="button" size="sm" variant="outline" disabled={loading} onClick={run}>
            {loading ? 'Generando…' : 'Generar rótulo'}
        </Button>
    )
}
