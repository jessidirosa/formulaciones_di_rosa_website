"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, PackagePlus } from "lucide-react"
import { toast } from "sonner" // O la librería de notificaciones que uses

export default function EditarPedidoModal({ pedido }: { pedido: any }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState(pedido.items.map((item: any) => ({ ...item })))

    // Cálculos dinámicos
    const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.precioUnitario) * Number(item.cantidad)), 0)
    const total = subtotal + (pedido.costoEnvio || 0) - (pedido.descuento || 0)

    const agregarItemPersonalizado = () => {
        setItems([
            ...items,
            {
                id: `new-${Date.now()}`,
                nombreProducto: "Preparación Personalizada",
                cantidad: 1,
                precioUnitario: 0,
                subtotal: 0,
                productoId: null // Identifica que no es del catálogo
            }
        ])
    }

    const actualizarItem = (id: string, campo: string, valor: any) => {
        setItems(items.map((item: any) => {
            if (item.id === id) {
                const nuevoItem = { ...item, [campo]: valor }
                nuevoItem.subtotal = nuevoItem.cantidad * nuevoItem.precioUnitario
                return nuevoItem
            }
            return item
        }))
    }

    const eliminarItem = (id: string) => {
        setItems(items.filter((item: any) => item.id !== id))
    }

    const guardarCambios = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/pedidos/${pedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((item: any) => ({
                        ...item,
                        precioUnitario: Number(item.precioUnitario),
                        cantidad: Number(item.cantidad),
                        subtotal: Number(item.subtotal)
                    })),
                    subtotal,
                    total
                })
            })

            if (res.ok) {
                setOpen(false)
                router.refresh()
            } else {
                alert("Error al guardar los cambios")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 border-[#A3B18A] text-[#4A5D45] hover:bg-[#F5F5F0]">
                    Editar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-[#4A5D45] flex items-center gap-2">
                        Editar Pedido #{pedido.numero}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F9F9F7] text-[#5B6350] text-[10px] uppercase">
                                <tr>
                                    <th className="p-2 text-left">Producto</th>
                                    <th className="p-2 text-center w-20">Cant.</th>
                                    <th className="p-2 text-right w-32">Precio Unit.</th>
                                    <th className="p-2 text-right w-24">Subtotal</th>
                                    <th className="p-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="p-2">
                                            <Input
                                                value={item.nombreProducto}
                                                onChange={(e) => actualizarItem(item.id, "nombreProducto", e.target.value)}
                                                className="h-8 text-[11px] border-none focus-visible:ring-1 ring-[#A3B18A]"
                                                disabled={item.productoId !== null} // Solo editar nombre si es personalizado
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                value={item.cantidad}
                                                onChange={(e) => actualizarItem(item.id, "cantidad", Number(e.target.value))}
                                                className="h-8 text-center text-[11px]"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-400">$</span>
                                                <Input
                                                    type="number"
                                                    value={item.precioUnitario}
                                                    onChange={(e) => actualizarItem(item.id, "precioUnitario", Number(e.target.value))}
                                                    className="h-8 text-right text-[11px]"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-2 text-right text-[11px] font-bold text-gray-700">
                                            ${item.subtotal.toLocaleString("es-AR")}
                                        </td>
                                        <td className="p-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => eliminarItem(item.id)}
                                                className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center">
                        <Button
                            onClick={agregarItemPersonalizado}
                            variant="outline"
                            size="sm"
                            className="text-[10px] uppercase font-bold border-dashed border-[#A3B18A] text-[#4A5D45]"
                        >
                            <Plus className="w-3 h-3 mr-1" /> Item Personalizado
                        </Button>

                        <div className="text-right space-y-1 pr-4">
                            <p className="text-[10px] text-gray-500">Subtotal: ${subtotal.toLocaleString("es-AR")}</p>
                            <p className="text-[10px] text-gray-500">Envío: +${pedido.costoEnvio.toLocaleString("es-AR")}</p>
                            <p className="text-sm font-black text-[#4A5D45]">TOTAL: ${total.toLocaleString("es-AR")}</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={guardarCambios}
                        className="bg-[#4A5D45] hover:bg-[#3A4A37] text-white rounded-xl"
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}