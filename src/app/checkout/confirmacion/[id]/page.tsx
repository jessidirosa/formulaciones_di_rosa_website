import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CheckCircle2, AlertCircle, Clock, ShoppingBag } from "lucide-react"

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ status?: string }>;
}

export default async function ConfirmacionPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { status } = await searchParams;
    const pedidoId = Number(id);

    if (isNaN(pedidoId)) return notFound();

    // Buscar pedido en la base de datos
    const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
            items: true
        }
    })

    if (!pedido) return notFound();

    // ✅ Lógica de mensajes mejorada
    // Se considera aprobado si MP devuelve approved O si la DB ya fue confirmada por el webhook
    const isApproved = status === 'approved' || pedido.estado === 'confirmado';

    // Se considera pendiente si es transferencia O si MP devuelve pending O si aún está en pendiente_mercadopago
    const isPending = status === 'pending' ||
        pedido.estado === 'pending_payment_transfer' ||
        pedido.estado === 'pendiente_mercadopago';

    const isRejected = status === 'rejected' || status === 'failure';

    return (
        <div className="min-h-screen bg-[#F5F5F0] py-12 px-4">
            <Card className="max-w-2xl mx-auto border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="text-center pt-10 pb-2">
                    <div className="flex justify-center mb-4">
                        {isApproved && <CheckCircle2 className="w-16 h-16 text-[#4A5D45]" />}
                        {isPending && <Clock className="w-16 h-16 text-amber-500" />}
                        {isRejected && <AlertCircle className="w-16 h-16 text-red-500" />}
                        {!status && !isApproved && !isPending && !isRejected && <ShoppingBag className="w-16 h-16 text-[#A3B18A]" />}
                    </div>
                    <CardTitle className="text-3xl font-serif font-bold text-[#3A4031]">
                        {isApproved && "¡Pago Confirmado!"}
                        {isPending && (pedido.metodoPago === 'TRANSFERENCIA' ? "Pedido Recibido" : "Pago en Proceso")}
                        {isRejected && "Pago no procesado"}
                        {!status && !isApproved && !isPending && !isRejected && "¡Gracias por tu compra!"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                    <div className="text-center space-y-2 text-left">
                        <p className="text-gray-700">
                            Tu pedido <strong className="text-[#4A5D45]">#{pedido.numero}</strong> fue registrado correctamente.
                        </p>

                        {isRejected && (
                            <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                                Hubo un problema al procesar el pago con Mercado Pago. Por favor, intenta nuevamente o selecciona otro medio.
                            </p>
                        )}

                        {isPending && pedido.metodoPago === 'TRANSFERENCIA' && (
                            <p className="text-amber-700 text-sm bg-amber-50 p-3 rounded-xl border border-amber-100">
                                Recordá que tenés 1 hora para realizar la transferencia y avisar desde el link que enviamos a tu email.
                            </p>
                        )}

                        {isPending && pedido.metodoPago === 'MERCADOPAGO' && (
                            <p className="text-[#5B6350] text-sm italic">
                                Estamos esperando la confirmación de Mercado Pago. Te avisaremos por email cuando se acredite.
                            </p>
                        )}
                    </div>

                    <div className="bg-[#F9F9F7] p-6 rounded-2xl border border-[#E9E9E0]">
                        <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#A3B18A] mb-4 text-left">Resumen del pedido</h2>

                        <ul className="space-y-3">
                            {pedido.items.map(item => (
                                <li key={item.id} className="text-sm flex justify-between">
                                    <span className="text-[#5B6350]">{item.nombreProducto} <b className="text-[#3A4031]">× {item.cantidad}</b></span>
                                    <span className="font-bold text-[#4A5D45]">${item.subtotal.toLocaleString("es-AR")}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 pt-4 border-t border-[#E9E9E0] space-y-2 text-sm text-[#5B6350]">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${pedido.subtotal.toLocaleString("es-AR")}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Envío</span>
                                <span>{pedido.costoEnvio > 0 ? `$${pedido.costoEnvio.toLocaleString("es-AR")}` : "Sin cargo"}</span>
                            </div>

                            {pedido.descuento > 0 && (
                                <div className="flex justify-between text-[#A3B18A] font-bold">
                                    <span>Descuento aplicado</span>
                                    <span>-${pedido.descuento.toLocaleString("es-AR")}</span>
                                </div>
                            )}

                            <div className="flex justify-between mt-2 pt-2 border-t-2 border-[#E9E9E0] text-xl font-serif font-bold text-[#4A5D45]">
                                <span>Total</span>
                                <span>${pedido.total.toLocaleString("es-AR")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <p className="text-center text-xs text-[#A3B18A] font-medium uppercase tracking-widest">
                            Próximos pasos
                        </p>
                        <p className="text-center text-sm text-[#5B6350] leading-relaxed">
                            {isApproved
                                ? "Nuestro equipo de laboratorio comenzará con la formulación de tu pedido a la brevedad. Recibirás un mail con el seguimiento."
                                : "Te enviamos un email con el acceso a tu seguimiento y los pasos a seguir para completar tu pedido."
                            }
                        </p>
                    </div>

                    <div className="flex justify-center pt-6">
                        <a
                            href="/"
                            className="bg-[#4A5D45] text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#3A4031] transition-all shadow-lg"
                        >
                            Volver a la tienda
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}