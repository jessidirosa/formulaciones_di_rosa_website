"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    Package, Truck, Calendar, Clock, ExternalLink, AlertCircle,
    CheckCircle2, FlaskConical, Boxes, Landmark, ChevronRight, Loader2, Tag, CreditCard, ArrowRight, Sparkles
} from "lucide-react"

function formatARS(n: number) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)
}

// ✅ Función corregida para mostrar el rango de fecha igual que en el checkout
function formatFechaEstimadaConsistente(fechaIso: string) {
    if (!fechaIso) return ""
    const d = new Date(fechaIso)
    const inicio = new Date(d); inicio.setDate(d.getDate() - 2);
    const fin = new Date(d); fin.setDate(d.getDate() + 2);

    const diaIn = inicio.getDate();
    const diaFin = fin.getDate();
    const mes = fin.toLocaleDateString("es-AR", { month: 'long' });

    return `${diaIn} al ${diaFin} de ${mes}`;
}

const INFO_ESTADOS: Record<string, { title: string, desc: string, next: string, icon: any, color: string }> = {
    pending_payment_transfer: {
        title: "Esperando Transferencia",
        desc: "Tu pedido está reservado. Por favor, realizá la transferencia y avisanos desde el botón de abajo.",
        next: "Validación de tu pago.",
        icon: Landmark,
        color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    pendiente_mercadopago: {
        title: "Pago en Proceso",
        desc: "Estamos esperando la confirmación de Mercado Pago. Si tuviste un problema, podés reintentar el pago.",
        next: "Confirmación e ingreso a laboratorio.",
        icon: CreditCard,
        color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    transfer_proof_sent: {
        title: "Validando Comprobante",
        desc: "Recibimos tu aviso de pago. Nuestro equipo está verificando la acreditación.",
        next: "Confirmación e ingreso a laboratorio.",
        icon: Clock,
        color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    confirmado: {
        title: "Orden Confirmada",
        desc: "¡Pago recibido! Tu pedido ha ingresado a la lista de preparación.",
        next: "Elaboración en laboratorio.",
        icon: CheckCircle2,
        color: "text-[#4A5D45] bg-[#E9E9E0] border-[#A3B18A]"
    },
    en_produccion: {
        title: "En Laboratorio",
        desc: "Tus productos están siendo elaborados siguiendo protocolos magistrales.",
        next: "Control de calidad y empaque.",
        icon: FlaskConical,
        color: "text-[#4A5D45] bg-[#E9E9E0] border-[#A3B18A]"
    },
    // ESTADO DINÁMICO: Cambia según si es Envío o Retiro
    listo_envio: {
        title: "Pedido Finalizado",
        desc: "Tus productos ya están listos.", // Se sobreescribe abajo
        next: "Entrega final.",
        icon: Boxes,
        color: "text-[#4A5D45] bg-[#F9F9F7] border-[#E9E9E0]"
    },
    enviado: {
        title: "Pedido Despachado",
        desc: "Tu paquete ya se encuentra en manos del correo.",
        next: "Entrega en destino.",
        icon: Truck,
        color: "text-blue-700 bg-blue-50 border-blue-100"
    },
    entregado: {
        title: "Pedido Entregado",
        desc: "¡Gracias por elegir Formulaciones Di Rosa! Esperamos que disfrutes tus productos.",
        next: "Tu próxima rutina de cuidado.",
        icon: CheckCircle2,
        color: "text-green-700 bg-green-50 border-green-100"
    },
    cancelled_expired: {
        title: "Expirado",
        desc: "El tiempo para pagar venció.",
        next: "Realizar un nuevo pedido.",
        icon: AlertCircle,
        color: "text-red-400 bg-red-50 border-red-100"
    },
    cancelado: {
        title: "Pedido Cancelado",
        desc: "La orden ha sido anulada.",
        next: "Contactar con soporte si fue un error.",
        icon: AlertCircle,
        color: "text-red-600 bg-red-50 border-red-100"
    }
}

interface PageProps {
    params: Promise<{ token: string }>
}

export default function PedidoPublicPage({ params }: PageProps) {
    const { token } = use(params)
    const [pedido, setPedido] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const loadPedido = async () => {
        try {
            const res = await fetch(`/api/pedidos/public/${token}`)
            if (!res.ok) {
                setPedido(null)
                return
            }
            const data = await res.json()
            if (data.ok) {
                setPedido(data.pedido)
            } else {
                setPedido(null)
            }
        } catch (e) {
            console.error("Error cargando pedido:", e)
            setPedido(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) {
            loadPedido()
        }
    }, [token])

    const handleAvisarPago = async () => {
        setSending(true)
        try {
            const res = await fetch(`/api/pedidos/public/${token}/avisar-pago`, { method: 'POST' })
            if (res.ok) {
                toast.success("Aviso enviado correctamente")
                loadPedido()
            } else {
                toast.error("No se pudo enviar el aviso")
            }
        } catch (e) {
            toast.error("Error de conexión al enviar aviso")
        } finally {
            setSending(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]"><Loader2 className="animate-spin text-[#4A5D45]" /></div>

    if (!pedido) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
            <div className="p-20 text-center text-[#5B6350] font-medium italic">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-20" />
                Pedido no encontrado
            </div>
        </div>
    )

    const estadoLwr = pedido.estado.toLowerCase()
    let info = INFO_ESTADOS[estadoLwr] || { title: pedido.estado, desc: "Procesando...", next: "Pronto habrá novedades.", icon: Package, color: "bg-gray-50 text-gray-700" }
    // ✅ LÓGICA PARA RETIRO EN LABORATORIO
    const esRetiro = pedido.tipoEntrega === "RETIRO_LOCAL" || pedido.metodoEnvio === "RETIRO_LOCAL"
    const subtotalItems = pedido.items.reduce((acc: number, item: any) => acc + (item.subtotal || 0), 0)
    const mostrarFechaEstimada = !["enviado", "entregado", "cancelled_expired", "cancelado"].includes(estadoLwr)

    if (estadoLwr === "listo_envio") {
        if (esRetiro) {
            info = {
                ...info,
                title: "Listo para Retirar",
                desc: "¡Tu fórmula está lista! Te vamos a estar hablando por WhatsApp para coordinar la entrega.",
                next: "Retiro presencial en punto de retira.",
                icon: Package
            }
        } else {
            info = {
                ...info,
                title: "Listo para Despacho",
                desc: "Productos formulados y empaquetados. Esperando retiro del transporte.",
                next: "Envío y código de seguimiento."
            }
        }
    }
    return (
        <div className="min-h-screen bg-[#F5F5F0] py-12 px-4">
            <div className="container mx-auto max-w-2xl space-y-6 text-left">
                <header className="flex justify-between items-center">
                    <div className="text-left">
                        <h1 className="text-3xl font-serif font-bold text-[#3A4031]">Estado de tu pedido</h1>
                        <p className="text-[10px] font-bold text-[#A3B18A] uppercase tracking-widest">Orden #{pedido.numero}</p>
                    </div>
                    <Badge variant="outline" className={`h-8 px-4 rounded-full font-bold uppercase text-[10px] ${info.color}`}>
                        {info.title}
                    </Badge>
                </header>

                <Card className={`border shadow-sm rounded-2xl overflow-hidden ${info.color}`}>
                    <CardContent className="p-5 flex flex-col gap-4">
                        <div className="flex gap-4">
                            <info.icon className="w-6 h-6 mt-1 flex-shrink-0" />
                            <div className="space-y-2 flex-1 text-left">
                                <h3 className="font-bold uppercase text-[10px] tracking-widest">Etapa Actual</h3>
                                <p className="text-sm font-medium">{info.desc}</p>
                            </div>

                        </div>

                        {mostrarFechaEstimada && pedido.fechaEstimadaEnvio && (
                            <div className="mt-2 p-4 bg-white/40 rounded-xl border border-black/5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 opacity-70 flex-shrink-0" />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">
                                            {esRetiro ? "Disponible para retirar" : "Fecha estimada de despacho"}
                                        </span>
                                        <span className="text-xs font-bold capitalize">
                                            {formatFechaEstimadaConsistente(pedido.fechaEstimadaEnvio)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 pt-2 border-t border-black/5">
                                    <Sparkles className="w-3 h-3 text-[#4A5D45] mt-0.5 flex-shrink-0 opacity-60" />
                                    <p className="text-[9px] text-[#4A5D45] leading-relaxed italic font-medium opacity-80">
                                        Cada producto es formulado y elaborado específicamente para vos, respetando los tiempos de preparación magistral.
                                    </p>
                                </div>
                            </div>
                        )}

                        {estadoLwr === "pending_payment_transfer" && (
                            <div className="mt-2 pt-4 border-t border-black/5">
                                <button
                                    onClick={handleAvisarPago}
                                    disabled={sending}
                                    className="w-full bg-[#4A5D45] text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#3A4031] transition-colors"
                                >
                                    {sending ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                    Ya realicé la transferencia
                                </button>
                            </div>
                        )}

                        {estadoLwr === "pendiente_mercadopago" && pedido.mercadopagoUrl && (
                            <div className="mt-2 pt-4 border-t border-black/5">
                                <a
                                    href={pedido.mercadopagoUrl}
                                    className="w-full bg-[#4A5D45] text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#3A4031] transition-colors"
                                >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Completar pago con Mercado Pago
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </a>
                            </div>
                        )}

                        <div className="pt-2 flex items-start gap-2 border-t border-black/5 text-left">
                            <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                            <p className="text-[11px] font-bold uppercase italic opacity-80">Próximo paso: {info.next}</p>
                        </div>
                    </CardContent>
                </Card>

                {pedido.estado === "enviado" && pedido.trackingNumber && (
                    <Card className="border-blue-200 bg-blue-50 rounded-2xl overflow-hidden shadow-sm">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-3 text-blue-700">
                                <Truck className="w-6 h-6" />
                                <h3 className="font-bold uppercase text-[10px] tracking-widest">Seguimiento de Envío</h3>
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                                <p className="text-xs text-blue-600 font-medium">Empresa: <span className="font-bold">{pedido.carrier === 'CORREO_ARGENTINO' ? 'Correo Argentino' : 'Andreani'}</span></p>
                                <p className="text-sm font-bold text-blue-900">Código: {pedido.trackingNumber}</p>
                            </div>
                            <a
                                href={pedido.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                                Rastrear Paquete <ExternalLink className="h-3 w-3" />
                            </a>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="bg-[#F9F9F7] border-b border-[#E9E9E0]">
                        <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-[#A3B18A] text-left">Resumen de Inversión</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            {pedido.items.map((it: any) => (
                                <div key={it.id} className="flex justify-between text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[#3A4031] text-left">{it.nombreProducto}</span>
                                        <span className="text-[10px] text-[#A3B18A] font-bold text-left">X {it.cantidad}</span>
                                    </div>
                                    <span className="font-bold text-[#4A5D45]">{formatARS(it.subtotal)}</span>
                                </div>
                            ))}
                        </div>
                        <Separator className="bg-[#F5F5F0]" />
                        <div className="space-y-2 text-[11px] uppercase tracking-wider font-bold text-[#5B6350]">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatARS(subtotalItems)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Envío</span>
                                <span>{pedido.costoEnvio > 0 ? formatARS(pedido.costoEnvio) : "Sin cargo"}</span>
                            </div>
                            {pedido.descuento > 0 && (
                                <div className="flex justify-between text-[#A3B18A]">
                                    <span className="flex items-center gap-1 text-left"><Tag className="w-3 h-3" /> Descuento</span>
                                    <span>- {formatARS(pedido.descuento)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[#4A5D45] pt-2 border-t border-[#F9F9F7]">
                                <span className="flex items-center gap-1 text-left"><CreditCard className="w-3 h-3" /> Método de Pago</span>
                                <span>{pedido.metodoPago === 'MERCADOPAGO' ? 'Mercado Pago' : 'Transferencia Bancaria'}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-baseline pt-4 border-t-2 border-[#F9F9F7]">
                            <span className="text-sm font-black text-[#3A4031] uppercase">Total</span>
                            <span className="text-3xl font-serif font-bold text-[#4A5D45]">{formatARS(pedido.total)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}