"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, ShoppingBag, Loader2, User, Truck, CreditCard } from "lucide-react"

interface ItemPedido {
    productoId?: number
    nombreProducto: string
    cantidad: number
    precioUnitario: number
    notas?: string
}

export default function CrearPedidoModal() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [productosCatalogo, setProductosCatalogo] = useState<any[]>([])

    // Formulario principal
    const [nombreCliente, setNombreCliente] = useState("")
    const [apellidoCliente, setApellidoCliente] = useState("")
    const [emailCliente, setEmailCliente] = useState("")
    const [telefonoCliente, setTelefonoCliente] = useState("")
    const [dniCliente, setDniCliente] = useState("")

    const [direccion, setDireccion] = useState("")
    const [localidad, setLocalidad] = useState("")
    const [provincia, setProvincia] = useState("")
    const [codigoPostal, setCodigoPostal] = useState("")

    const [tipoEntrega, setTipoEntrega] = useState("RETIRO_LOCAL")
    const [metodoPago, setMetodoPago] = useState("TRANSFERENCIA")
    const [estado, setEstado] = useState("confirmado")
    const [costoEnvio, setCostoEnvio] = useState<number | "">(0)
    const [descuento, setDescuento] = useState<number | "">(0)
    const [fechaEstimadaEnvio, setFechaEstimadaEnvio] = useState("")
    const [notasCliente, setNotasCliente] = useState("")

    const [items, setItems] = useState<ItemPedido[]>([])

    // Cargar productos activos para autocompletar
    useEffect(() => {
        if (open) {
            fetch("/api/admin/productos")
                .then(res => res.json())
                .then(data => setProductosCatalogo(data.productos || []))
                .catch(err => console.error(err))
        }
    }, [open])

    const agregarItem = () => {
        setItems(prev => [...prev, { nombreProducto: "", cantidad: 1, precioUnitario: 0 }])
    }

    const seleccionarProductoCatalogo = (index: number, prodId: string) => {
        const prod = productosCatalogo.find(p => String(p.id) === prodId)
        if (!prod) return

        const newItems = [...items]
        newItems[index] = {
            productoId: prod.id,
            nombreProducto: prod.nombre,
            cantidad: 1,
            precioUnitario: prod.precio,
            notas: ""
        }
        setItems(newItems)
    }

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }

    const subtotalCalculado = items.reduce((acc, it) => acc + (it.precioUnitario * it.cantidad), 0)
    const totalCalculado = subtotalCalculado + Number(costoEnvio || 0) - Number(descuento || 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (items.length === 0) return toast.error("Agregá al menos un producto al pedido")
        if (!nombreCliente || !emailCliente) return toast.error("Nombre y Email son obligatorios")

        setLoading(true)
        try {
            const res = await fetch("/api/admin/pedidos/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombreCliente,
                    apellidoCliente,
                    emailCliente,
                    telefonoCliente,
                    dniCliente,
                    direccion,
                    localidad,
                    provincia,
                    codigoPostal,
                    tipoEntrega,
                    metodoPago,
                    estado,
                    costoEnvio: Number(costoEnvio || 0),
                    descuento: Number(descuento || 0),
                    fechaEstimadaEnvio: fechaEstimadaEnvio || null,
                    notasCliente,
                    items
                })
            })

            const data = await res.json()
            if (res.ok && data.ok) {
                toast.success(`Pedido #${data.pedido.numero} creado exitosamente`)
                setOpen(false)
                // ✅ LIMPIAR CAMPOS DEL FORMULARIO
                setItems([])
                setNombreCliente("")
                setApellidoCliente("")
                setEmailCliente("")
                setTelefonoCliente("")
                setDniCliente("")
                setDireccion("")
                setLocalidad("")
                setProvincia("")
                setCodigoPostal("")
                setNotasCliente("")
                setCostoEnvio(0)
                setDescuento(0)
                setFechaEstimadaEnvio("")
                router.refresh()
            } else {
                toast.error(data.error || "Error al crear pedido")
            }
        } catch (error) {
            toast.error("Error de conexión al crear pedido")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-xl shadow-sm text-xs font-bold uppercase tracking-widest gap-2 h-11 px-5">
                    <Plus className="w-4 h-4" /> Crear Pedido Manual
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 text-left">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-xl font-serif font-bold text-[#3A4031] flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#4A5D45]" /> Cargar Orden Manual
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* DATOS DEL CLIENTE */}
                    <div className="space-y-3 bg-[#F9F9F7] p-4 rounded-2xl border border-[#E9E9E0]">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#4A5D45] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> Datos del Cliente
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input placeholder="Nombre *" value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} required className="bg-white rounded-xl text-xs h-9" />
                            <Input placeholder="Apellido" value={apellidoCliente} onChange={e => setApellidoCliente(e.target.value)} className="bg-white rounded-xl text-xs h-9" />
                            <Input placeholder="Email *" type="email" value={emailCliente} onChange={e => setEmailCliente(e.target.value)} required className="bg-white rounded-xl text-xs h-9" />
                            <Input placeholder="Teléfono" value={telefonoCliente} onChange={e => setTelefonoCliente(e.target.value)} className="bg-white rounded-xl text-xs h-9" />
                            <Input placeholder="DNI / CUIL" value={dniCliente} onChange={e => setDniCliente(e.target.value)} className="bg-white rounded-xl text-xs h-9" />
                        </div>
                    </div>

                    {/* DATOS DE ENTREGA */}
                    <div className="space-y-3 bg-[#F9F9F7] p-4 rounded-2xl border border-[#E9E9E0]">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#4A5D45] flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" /> Logística y Entrega
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Tipo de Entrega</label>
                                <select value={tipoEntrega} onChange={e => setTipoEntrega(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 h-9 text-xs font-semibold">
                                    <option value="RETIRO_LOCAL">Retiro en Local</option>
                                    <option value="ENVIO_DOMICILIO">Envío a Domicilio</option>
                                    <option value="SUCURSAL_CORREO">Sucursal de Correo</option>
                                    <option value="MOTOMENSAJERIA">Motomensajería</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Método Pago</label>
                                <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 h-9 text-xs font-semibold">
                                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                                    <option value="MERCADOPAGO">Mercado Pago</option>
                                    <option value="EFECTIVO">Efectivo</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Estado Inicial</label>
                                <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 h-9 text-xs font-semibold">
                                    <option value="confirmado">Confirmado (Pago OK)</option>
                                    <option value="en_produccion">En Producción</option>
                                    <option value="pending_payment_transfer">Esperando Pago</option>
                                    <option value="listo_envio">Listo para Envío</option>
                                    <option value="entregado">Entregado</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Fecha Est. Envío</label>
                                <Input
                                    type="date"
                                    value={fechaEstimadaEnvio}
                                    onChange={e => setFechaEstimadaEnvio(e.target.value)}
                                    className="bg-white rounded-xl text-xs h-9"
                                />
                            </div>
                        </div>

                        {tipoEntrega !== "RETIRO_LOCAL" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <Input placeholder="Dirección (Calle y altura)" value={direccion} onChange={e => setDireccion(e.target.value)} className="bg-white rounded-xl text-xs h-9" />
                                <Input placeholder="Localidad / Ciudad" value={localidad} onChange={e => setLocalidad(e.target.value)} className="bg-white rounded-xl text-xs h-9" />
                                <Input placeholder="Provincia" value={provincia} onChange={e => setProvincia(e.target.value)} className="bg-white rounded-xl text-xs h-9" />
                                <Input placeholder="Código Postal" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} className="bg-white rounded-xl text-xs h-9" />
                            </div>
                        )}
                    </div>

                    {/* ITEMS DEL PEDIDO */}
                    <div className="space-y-3 bg-[#F9F9F7] p-4 rounded-2xl border border-[#E9E9E0]">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#4A5D45]">Productos en la orden</h4>
                            <Button type="button" variant="outline" size="sm" onClick={agregarItem} className="h-7 text-[10px] font-bold uppercase rounded-lg border-[#4A5D45] text-[#4A5D45]">
                                + Agregar Producto
                            </Button>
                        </div>

                        {items.length === 0 ? (
                            <p className="text-xs text-gray-400 italic text-center py-4">No hay productos cargados todavía.</p>
                        ) : (
                            <div className="space-y-3">
                                {items.map((it, idx) => (
                                    <div key={idx} className="p-3 bg-white border rounded-xl space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                            {/* Selector del catálogo opcional */}
                                            <div className="sm:col-span-5">
                                                <select
                                                    onChange={e => seleccionarProductoCatalogo(idx, e.target.value)}
                                                    className="w-full bg-[#F5F5F0] border rounded-lg px-2 h-8 text-[11px] mb-1 font-medium"
                                                >
                                                    <option value="">-- Cargar de catálogo --</option>
                                                    {productosCatalogo.map(p => (
                                                        <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
                                                    ))}
                                                </select>
                                                <Input
                                                    placeholder="Nombre del producto *"
                                                    value={it.nombreProducto}
                                                    onChange={e => {
                                                        const newItems = [...items]
                                                        newItems[idx].nombreProducto = e.target.value
                                                        setItems(newItems)
                                                    }}
                                                    className="text-xs h-8 rounded-lg"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="text-[9px] uppercase text-gray-400 font-bold block">Cant</label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={it.cantidad}
                                                    onChange={e => {
                                                        const newItems = [...items]
                                                        newItems[idx].cantidad = Number(e.target.value)
                                                        setItems(newItems)
                                                    }}
                                                    className="text-xs h-8 rounded-lg text-center"
                                                />
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label className="text-[9px] uppercase text-gray-400 font-bold block">Precio ($)</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={it.precioUnitario}
                                                    onChange={e => {
                                                        const newItems = [...items]
                                                        newItems[idx].precioUnitario = Number(e.target.value)
                                                        setItems(newItems)
                                                    }}
                                                    className="text-xs h-8 rounded-lg"
                                                />
                                            </div>

                                            <div className="sm:col-span-2 flex justify-end">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)} className="h-8 w-8 p-0 text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <Input
                                            placeholder="Notas de la fórmula / aclaraciones"
                                            value={it.notas || ""}
                                            onChange={e => {
                                                const newItems = [...items]
                                                newItems[idx].notas = e.target.value
                                                setItems(newItems)
                                            }}
                                            className="text-[11px] h-7 bg-[#F9F9F7] rounded-md italic"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* VALORES FINALES Y TOTALES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end bg-[#F5F5F0] p-4 rounded-2xl border">
                        <div className="space-y-2">
                            <Input placeholder="Notas generales para el cliente" value={notasCliente} onChange={e => setNotasCliente(e.target.value)} className="bg-white text-xs h-9 rounded-xl" />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-gray-400 block">Costo Envío ($)</label>
                                    <Input type="number" min="0" value={costoEnvio} onChange={e => setCostoEnvio(e.target.value === "" ? "" : Number(e.target.value))} className="bg-white text-xs h-8 rounded-lg" />
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-gray-400 block">Descuento ($)</label>
                                    <Input type="number" min="0" value={descuento} onChange={e => setDescuento(e.target.value === "" ? "" : Number(e.target.value))} className="bg-white text-xs h-8 rounded-lg" />
                                </div>
                            </div>
                        </div>

                        <div className="text-right space-y-1">
                            <p className="text-xs text-gray-500">Subtotal: <span className="font-bold text-gray-700">${subtotalCalculado.toLocaleString("es-AR")}</span></p>
                            <p className="text-2xl font-serif font-bold text-[#4A5D45]">Total: ${totalCalculado.toLocaleString("es-AR")}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-11 text-xs uppercase font-bold">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-[#4A5D45] text-white rounded-xl h-11 text-xs uppercase font-bold px-6">
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar Pedido"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}