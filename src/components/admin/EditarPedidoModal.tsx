"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Asegurate de tener este componente de shadcn
import { Plus, Trash2, User, MapPin, FileText, CreditCard } from "lucide-react"

export default function EditarPedidoModal({ pedido }: { pedido: any }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Estados para edición
    const [items, setItems] = useState(pedido.items.map((item: any) => ({
        ...item,
        precioUnitario: item.subtotal / item.cantidad
    })))
    const [descuento, setDescuento] = useState(pedido.descuento || 0)
    const [notasCliente, setNotasCliente] = useState(pedido.notasCliente || "")
    const [contacto, setContacto] = useState({
        nombreCliente: pedido.nombreCliente || "",
        apellidoCliente: pedido.apellidoCliente || "",
        emailCliente: pedido.emailCliente || "",
        telefonoCliente: pedido.telefonoCliente || "",
        direccion: pedido.direccion || "",
        localidad: pedido.localidad || "",
    })

    const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.precioUnitario) * Number(item.cantidad)), 0)
    const total = subtotal + (pedido.costoEnvio || 0) - Number(descuento)

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

    const guardarCambios = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/pedidos/${pedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((item: any) => ({
                        productoId: item.productoId,
                        nombreProducto: item.nombreProducto,
                        cantidad: item.cantidad,
                        subtotal: item.subtotal
                    })),
                    subtotal,
                    total,
                    descuento,
                    notasCliente,
                    datosContacto: contacto
                })
            })

            if (res.ok) {
                setOpen(false)
                router.refresh()
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
                <Button variant="outline" size="sm" className="h-8 border-[#A3B18A] text-[#4A5D45]">Editar</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-[#4A5D45]">Gestionar Pedido #{pedido.numero}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* COLUMNA IZQUIERDA: PRODUCTOS Y NOTAS */}
                    <div className="space-y-6">
                        <section className="space-y-3">
                            <Label className="text-[10px] uppercase font-black text-[#A3B18A]">Productos de la Orden</Label>
                            <div className="border rounded-xl overflow-hidden text-[11px]">
                                <table className="w-full">
                                    <tbody className="divide-y">
                                        {items.map((item: any) => (
                                            <tr key={item.id} className="bg-white">
                                                <td className="p-2 w-full">
                                                    <Input
                                                        value={item.nombreProducto}
                                                        onChange={(e) => actualizarItem(item.id, "nombreProducto", e.target.value)}
                                                        className="h-7 text-[10px] border-none p-0 focus-visible:ring-0"
                                                        disabled={item.productoId !== null}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={item.cantidad}
                                                        onChange={(e) => actualizarItem(item.id, "cantidad", Number(e.target.value))}
                                                        className="h-7 w-12 text-center"
                                                    />
                                                </td>
                                                <td className="p-2 text-right font-bold">
                                                    ${item.subtotal.toLocaleString("es-AR")}
                                                </td>
                                                <td className="p-2">
                                                    <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((i: any) => i.id !== item.id))} className="h-6 w-6 p-0 text-red-400"><Trash2 className="w-3 h-3" /></Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button onClick={() => setItems([...items, { id: Date.now(), nombreProducto: "Personalizado", cantidad: 1, precioUnitario: 0, subtotal: 0, productoId: null }])} variant="outline" className="w-full h-8 text-[9px] uppercase font-bold border-dashed border-[#A3B18A] text-[#4A5D45]">
                                <Plus className="w-3 h-3 mr-1" /> Agregar Ítem
                            </Button>
                        </section>

                        <section className="space-y-3">
                            <Label className="text-[10px] uppercase font-black text-[#A3B18A] flex items-center gap-1"><FileText className="w-3 h-3" /> Notas / Observaciones</Label>
                            <Textarea
                                value={notasCliente}
                                onChange={(e) => setNotasCliente(e.target.value)}
                                placeholder="Notas internas o del cliente..."
                                className="text-xs rounded-xl min-h-[100px] bg-[#F9F9F7]"
                            />
                        </section>
                    </div>

                    {/* COLUMNA DERECHA: CONTACTO Y TOTALES */}
                    <div className="space-y-6">
                        <section className="space-y-3 bg-[#F9F9F7] p-4 rounded-2xl">
                            <Label className="text-[10px] uppercase font-black text-[#4A5D45] flex items-center gap-1"><User className="w-3 h-3" /> Datos de Contacto</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input value={contacto.nombreCliente} onChange={e => setContacto({ ...contacto, nombreCliente: e.target.value })} placeholder="Nombre" className="h-8 text-xs bg-white" />
                                <Input value={contacto.apellidoCliente} onChange={e => setContacto({ ...contacto, apellidoCliente: e.target.value })} placeholder="Apellido" className="h-8 text-xs bg-white" />
                                <Input value={contacto.emailCliente} onChange={e => setContacto({ ...contacto, emailCliente: e.target.value })} placeholder="Email" className="h-8 text-xs bg-white col-span-2" />
                                <Input value={contacto.telefonoCliente} onChange={e => setContacto({ ...contacto, telefonoCliente: e.target.value })} placeholder="Teléfono" className="h-8 text-xs bg-white col-span-2" />
                            </div>
                            <Label className="text-[10px] uppercase font-black text-[#4A5D45] flex items-center gap-1 pt-2"><MapPin className="w-3 h-3" /> Dirección</Label>
                            <Input value={contacto.direccion} onChange={e => setContacto({ ...contacto, direccion: e.target.value })} placeholder="Calle y Nro" className="h-8 text-xs bg-white" />
                            <Input value={contacto.localidad} onChange={e => setContacto({ ...contacto, localidad: e.target.value })} placeholder="Localidad" className="h-8 text-xs bg-white" />
                        </section>

                        <section className="space-y-3 border-t pt-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-bold text-gray-700">${subtotal.toLocaleString("es-AR")}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Costo de Envío</span>
                                <span className="font-bold text-gray-700">+${pedido.costoEnvio.toLocaleString("es-AR")}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-red-600 font-bold">
                                <span>Descuento / Cupón</span>
                                <div className="flex items-center gap-1">
                                    <span>- $</span>
                                    <Input
                                        type="number"
                                        value={descuento}
                                        onChange={(e) => setDescuento(Number(e.target.value))}
                                        className="h-7 w-20 text-right bg-white"
                                    />
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 my-4" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-black text-[#4A5D45] uppercase">Total Final</span>
                                <span className="text-2xl font-bold text-[#4A5D45]">${total.toLocaleString("es-AR")}</span>
                            </div>
                        </section>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
                    <Button onClick={guardarCambios} className="bg-[#4A5D45] hover:bg-[#3A4A37] text-white rounded-xl" disabled={loading}>
                        {loading ? "Guardando..." : "Aplicar Cambios"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}