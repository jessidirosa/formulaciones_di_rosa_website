'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Loader2, Truck, Ticket, ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    pedido: any
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function DespacharPedidoModal({ pedido, isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [manualTracking, setManualTracking] = useState('')
    const [mode, setMode] = useState<'auto' | 'manual'>('auto')

    const handleDespachoAutomatico = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/pedidos/${pedido.id}/shipping/generar-rotulo`, {
                method: 'POST'
            })
            const data = await res.json()
            if (data.ok) {
                toast.success("Rótulo generado y cliente notificado")
                onSuccess()
                onClose()
            } else {
                toast.error(data.error || "Error al generar rótulo")
            }
        } catch (e) {
            toast.error("Error de conexión con la API de correo")
        } finally {
            setLoading(false)
        }
    }

    const handleDespachoManual = async () => {
        if (!manualTracking) return toast.error("Ingresá un número de seguimiento")
        setLoading(true)
        try {
            // Esta es la ruta que creamos antes para carga manual
            const res = await fetch(`/api/admin/pedidos/${pedido.id}/despachar`, {
                method: 'PATCH',
                body: JSON.stringify({
                    trackingNumber: manualTracking,
                    carrier: pedido.carrier // Usamos el carrier que ya tiene el pedido
                })
            })
            if (res.ok) {
                toast.success("Seguimiento cargado y cliente notificado")
                onSuccess()
                onClose()
            }
        } catch (e) {
            toast.error("Error al guardar el seguimiento")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-serif text-2xl text-[#3A4031]">
                        <Truck className="h-6 w-6 text-[#4A5D45]" />
                        Despachar Pedido #{pedido.numero}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex bg-[#F5F5F0] p-1 rounded-xl">
                        <button
                            className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${mode === 'auto' ? 'bg-white shadow-sm text-[#4A5D45]' : 'text-[#A3B18A]'}`}
                            onClick={() => setMode('auto')}
                        >
                            Automático (API)
                        </button>
                        <button
                            className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${mode === 'manual' ? 'bg-white shadow-sm text-[#4A5D45]' : 'text-[#A3B18A]'}`}
                            onClick={() => setMode('manual')}
                        >
                            Manual
                        </button>
                    </div>

                    {mode === 'auto' ? (
                        <div className="text-center space-y-3 py-4">
                            <Ticket className="h-12 w-12 text-[#A3B18A] mx-auto opacity-50" />
                            <p className="text-sm text-[#5B6350]">
                                Se generará el rótulo oficial de <b>{pedido.carrier}</b> y se le enviará el link de seguimiento al cliente automáticamente.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-bold text-[#A3B18A]">Número de Seguimiento</label>
                            <Input
                                placeholder="Ej: AR123456789"
                                value={manualTracking}
                                onChange={(e) => setManualTracking(e.target.value.toUpperCase())}
                                className="rounded-xl border-[#E9E9E0]"
                            />
                            <p className="text-[10px] italic text-[#A3B18A]">
                                Cargá el código que te dio el correo al despachar por mostrador.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-[10px] uppercase font-bold"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={mode === 'auto' ? handleDespachoAutomatico : handleDespachoManual}
                        disabled={loading}
                        className="bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest px-8"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Despacho"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}