import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Package,
    Truck,
    Calendar,
    Clock,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    CreditCard,
    FlaskConical,
    Boxes,
    MapPin,
    Landmark,      // Añadido
    ChevronRight,   // Añadido
    Loader2
} from "lucide-react"

export const dynamic = "force-dynamic"

function formatARS(n: number) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(n)
}

function formatDate(d?: Date | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("es-AR", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

// Mapeo de estados con su respectiva información técnica
const INFO_ESTADOS: Record<string, { title: string, desc: string, next: string, icon: any, color: string }> = {
    pending_payment_transfer: {
        title: "Esperando Transferencia",
        desc: "Tu pedido está reservado. Estamos a la espera de recibir el comprobante de pago para ingresar la orden al laboratorio.",
        next: "Una vez enviado el aviso, un farmacéutico validará el ingreso del pago.",
        icon: Landmark,
        color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    transfer_proof_sent: {
        title: "Validando Comprobante",
        desc: "Recibimos tu aviso de pago. Nuestro equipo administrativo está verificando la acreditación en la cuenta bancaria.",
        next: "Al confirmarse, tu pedido pasará a la etapa de formulación en laboratorio.",
        icon: CheckCircle2,
        color: "text-[#4A5D45] bg-[#E9E9E0] border-[#A3B18A]"
    },
    en_produccion: {
        title: "En Laboratorio",
        desc: "Tus productos están siendo elaborados siguiendo protocolos de formulación magistral para asegurar su máxima frescura y pureza.",
        next: "Al finalizar su preparación, el pedido será cuidadosamente empaquetado.",
        icon: FlaskConical,
        color: "text-[#4A5D45] bg-[#E9E9E0] border-[#A3B18A]"
    },
    listo_envio: {
        title: "Control de Calidad Finalizado",
        desc: "Tus productos ya han sido formulados y controlados. Se encuentran en el área de despacho listos para ser entregados al transporte.",
        next: "En las próximas horas recibirás el código de seguimiento por este mismo medio.",
        icon: Boxes,
        color: "text-[#4A5D45] bg-[#F9F9F7] border-[#E9E9E0]"
    },
    enviado: {
        title: "Pedido Despachado",
        desc: "Tu paquete ya se encuentra en manos del correo e inició su viaje hacia tu domicilio.",
        next: "Podés seguir el trayecto en tiempo real con el link de tracking adjunto.",
        icon: Truck,
        color: "text-blue-700 bg-blue-50 border-blue-100"
    },
    confirmado: {
        title: "Orden Confirmada",
        desc: "El pago ha sido acreditado con éxito. Tu pedido ha ingresado formalmente a nuestra lista de espera de preparación.",
        next: "Iniciaremos la elaboración según nuestra capacidad productiva actual.",
        icon: CheckCircle2,
        color: "text-[#4A5D45] bg-[#E9E9E0] border-[#A3B18A]"
    },
    entregado: {
        title: "Entregado con Éxito",
        desc: "¡Ya tenés tu pedido! Esperamos que disfrutes de tus productos formulados especialmente para vos.",
        next: "¿Ya estás pensando en el nuevo pedido? ¡Te esperamos pronto!",
        icon: CheckCircle2,
        color: "text-[#4A5D45] bg-[#E9E9E0] border-[#A3B18A]"
    },
    cancelado: {
        title: "Orden Anulada",
        desc: "Este pedido ha sido cancelado. Para más información comunicate a nuestro WhatsApp",
        next: "Si deseas realizar la compra nuevamente, podés iniciar un nuevo carrito.",
        icon: AlertCircle,
        color: "text-red-700 bg-red-50 border-red-100"
    }
}

export default async function PedidoPublicPage({
    params,
}: {
    params: { token: string }
}) {
    const { token } = params

    const pedido = await prisma.pedido.findUnique({
        where: { publicToken: token },
        include: { items: true },
    })

    if (!pedido) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#F5F5F0]">
                <Card className="max-w-md border-none shadow-xl rounded-3xl">
                    <CardContent className="pt-8 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                        <h1 className="text-xl font-bold text-[#3A4031]">Pedido no encontrado</h1>
                        <p className="text-sm text-[#5B6350]">Link inválido o pedido inexistente.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const estadoLwr = pedido.estado.toLowerCase()
    const info = INFO_ESTADOS[estadoLwr] || {
        title: pedido.estado,
        desc: "Estamos procesando tu pedido en nuestras oficinas.",
        next: "Te informaremos cualquier cambio por este medio.",
        icon: Package,
        color: "bg-gray-50 text-gray-700 border-gray-100"
    }

    // Lógica de visibilidad para la estimación
    const mostrarEstimacion =
        pedido.fechaEstimadaEnvio &&
        !['enviado', 'entregado', 'cancelado', 'cancelled_expired'].includes(estadoLwr)

    return (
        <div className="min-h-screen bg-[#F5F5F0] py-12 px-4 font-sans">
            <div className="container mx-auto max-w-2xl space-y-6">

                {/* Cabecera */}
                <header className="space-y-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-[#3A4031]">Estado de tu pedido</h1>
                            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A] mt-1">
                                Orden #{pedido.numero}
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Badge variant="outline" className={`h-8 px-4 rounded-full font-bold uppercase text-[10px] tracking-widest ${info.color}`}>
                                {info.title}
                            </Badge>
                        </div>
                    </div>
                </header>

                {/* TARJETA DE PROCESO ACTUAL */}
                <Card className={`border shadow-sm rounded-2xl overflow-hidden ${info.color}`}>
                    <CardContent className="p-5 flex gap-4">
                        <div className="mt-1">
                            <info.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h3 className="font-bold uppercase text-[10px] tracking-widest leading-none">Etapa Actual</h3>
                            <p className="text-sm font-medium leading-relaxed">{info.desc}</p>
                            <div className="pt-2 flex items-start gap-2 border-t border-black/5">
                                <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                <p className="text-[11px] font-bold uppercase tracking-tight italic opacity-80">Próximo paso: {info.next}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ESTIMACIÓN DE ENTREGA */}
                {mostrarEstimacion && (
                    <Card className="border-none shadow-sm bg-[#E9E9E0] overflow-hidden rounded-2xl relative">
                        <FlaskConical className="absolute -right-2 -bottom-2 h-16 w-16 text-[#A3B18A] opacity-10 rotate-12" />
                        <CardContent className="p-5 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="bg-[#4A5D45] p-2.5 rounded-xl shadow-sm">
                                    <Calendar className="h-5 w-5 text-[#F5F5F0]" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A]">Compromiso de Preparación</p>
                                    <h4 className="text-[#3A4031] font-bold text-sm leading-tight">Fecha estimada de despacho / retiro</h4>
                                    <div className="pt-2">
                                        <span className="text-2xl font-serif font-bold text-[#4A5D45]">
                                            {formatDate(pedido.fechaEstimadaEnvio)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-3 text-[10px] text-[#5B6350] font-medium italic border-t border-[#D6D6C2] mt-2">
                                        <Clock className="h-3 w-3 text-[#A3B18A]" />
                                        <span>Calculado según los tiempos de maduración magistral.</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* TRACKING (Sólo si está enviado) */}
                {estadoLwr === 'enviado' && pedido.trackingNumber && (
                    <div className="bg-[#4A5D45] text-white rounded-2xl p-5 shadow-lg space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <span className="text-[9px] uppercase font-bold opacity-70">Número de Guía</span>
                                <div className="font-mono font-bold text-lg">{pedido.trackingNumber}</div>
                            </div>
                            {pedido.trackingUrl && (
                                <a href={pedido.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#A3B18A] text-[#4A5D45] px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-white transition-colors">
                                    Rastrear Envío <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* DETALLE TÉCNICO DE LA ORDEN */}
                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="bg-[#F9F9F7] border-b border-[#E9E9E0]">
                        <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A]">
                            Detalle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            {pedido.items.map((it) => (
                                <div key={it.id} className="flex justify-between items-start text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[#3A4031] uppercase text-xs">{it.nombreProducto}</span>
                                        <span className="text-[10px] text-[#A3B18A] font-bold italic uppercase tracking-tighter">Cant: {it.cantidad}</span>
                                    </div>
                                    <span className="font-medium text-[#5B6350]">{formatARS(it.subtotal)}</span>
                                </div>
                            ))}
                        </div>

                        <Separator className="bg-[#F5F5F0]" />

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-medium text-[#5B6350]">
                                <span>Subtotal</span>
                                <span>{formatARS(pedido.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-[#5B6350]">
                                <span>Envío</span>
                                <span>{pedido.costoEnvio === 0 ? "Sin Cargo" : formatARS(pedido.costoEnvio)}</span>
                            </div>
                            {pedido.descuento > 0 && (
                                <div className="flex justify-between text-xs font-bold text-[#A3B18A]">
                                    <span>Beneficio Aplicado</span>
                                    <span>-{formatARS(pedido.descuento)}</span>
                                </div>
                            )}
                            <Separator className="bg-[#F5F5F0]" />
                            <div className="flex justify-between items-baseline pt-2">
                                <span className="text-sm font-bold text-[#3A4031] uppercase tracking-widest">Inversión Final</span>
                                <span className="text-3xl font-serif font-bold text-[#4A5D45]">{formatARS(pedido.total)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F5F5F0]">
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#A3B18A] uppercase"><CreditCard className="w-3 h-3" /> Pago</span>
                                <span className="text-xs font-semibold text-[#5B6350] uppercase">{pedido.metodoPago || "—"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#A3B18A] uppercase"><Truck className="w-3 h-3" /> Entrega</span>
                                <span className="text-xs font-semibold text-[#5B6350] uppercase">{pedido.metodoEnvio || "—"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <footer className="text-center pt-8">
                    <p className="text-[10px] text-[#A3B18A] leading-relaxed max-w-sm mx-auto uppercase tracking-widest font-medium">
                        Laboratorio Di Rosa • Especialidades Magistrales
                    </p>
                </footer>
            </div>
        </div>
    )
}