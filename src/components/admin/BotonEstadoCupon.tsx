'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Power, PowerOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function BotonEstadoCupon({ cuponId, activo }: { cuponId: number, activo: boolean }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const toggleEstado = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/cupones/${cuponId}`, {
                method: 'PATCH',
                body: JSON.stringify({ activo: !activo })
            })
            if (res.ok) {
                toast.success(activo ? "Cupón desactivado" : "Cupón activado")
                router.refresh()
            }
        } catch (e) { toast.error("Error al cambiar estado") }
        finally { setLoading(false) }
    }

    return (
        <Button variant="ghost" size="sm" onClick={toggleEstado} disabled={loading}>
            {activo ? <Power className="w-4 h-4 text-green-500" /> : <PowerOff className="w-4 h-4 text-gray-400" />}
        </Button>
    )
}