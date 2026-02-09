'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

const ESTADOS = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendiente_mercadopago', label: 'MP Pendiente' },
    { id: 'pending_payment_transfer', label: 'Transf. Pendiente' },
    { id: 'transfer_proof_sent', label: 'Comprobante Enviado' },
    { id: 'confirmado', label: 'Confirmados' },
    { id: 'en_produccion', label: 'En Laboratorio' },
    { id: 'listo_envio', label: 'Listo p/ Despacho' },
    { id: 'enviado', label: 'Enviados' },
    { id: 'entregado', label: 'Entregados' },
    { id: 'cancelled_expired', label: 'Expirados' },
    { id: 'cancelado', label: 'Cancelados' },
]

export default function PedidosFiltros({ currentEstado }: { currentEstado: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleFilter = (estadoId: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (estadoId === 'todos') {
            params.delete('estado')
        } else {
            params.set('estado', estadoId)
        }
        router.push(`/admin/pedidos?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap gap-2">
            {ESTADOS.map((est) => (
                <Button
                    key={est.id}
                    variant={currentEstado === est.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilter(est.id)}
                    className={`text-[10px] uppercase font-bold tracking-widest rounded-lg h-9 ${currentEstado === est.id
                        ? 'bg-[#4A5D45] text-white hover:bg-[#3A4031]'
                        : 'border-[#E9E9E0] text-[#A3B18A] hover:bg-[#F9F9F7]'
                        }`}
                >
                    {est.label}
                </Button>
            ))}
        </div>
    )
}