'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Truck } from 'lucide-react'
import DespacharPedidoModal from './DespacharPedidoModal'
import { useRouter } from 'next/navigation'

export default function DespacharAccionesWrapper({ pedido }: { pedido: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="bg-[#4A5D45] text-white hover:bg-[#3A4031] h-8 text-[10px] uppercase font-bold tracking-widest"
                onClick={() => setIsOpen(true)}
            >
                <Truck className="w-3 h-3 mr-2" />
                Despachar
            </Button>

            <DespacharPedidoModal
                pedido={pedido}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSuccess={() => router.refresh()}
            />
        </>
    )
}