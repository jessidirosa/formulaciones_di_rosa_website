import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function ConfirmacionPage({ params }: { params: { id: string } }) {
    const pedidoId = Number(params.id)

    if (isNaN(pedidoId)) {
        return notFound()
    }

    // Buscar pedido en la base de datos
    const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
            items: true
        }
    })

    if (!pedido) {
        return notFound()
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <Card className="max-w-2xl mx-auto border-rose-200">
                <CardHeader>
                    <CardTitle className="text-2xl text-rose-600">
                        ¡Gracias por tu compra!
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">

                    <p className="text-gray-700">
                        Tu pedido <strong>#{pedido.numero}</strong> fue registrado correctamente.
                    </p>

                    <div className="bg-rose-50 p-4 rounded-lg">
                        <h2 className="font-semibold text-gray-900 mb-2">Resumen del pedido</h2>

                        <ul className="space-y-2">
                            {pedido.items.map(item => (
                                <li key={item.id} className="text-sm flex justify-between">
                                    <span>{item.nombreProducto} × {item.cantidad}</span>
                                    <span>${item.subtotal}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between mt-4 border-t pt-2 text-sm">
                            <span>Subtotal</span>
                            <span>${pedido.subtotal}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Envío</span>
                            <span>${pedido.costoEnvio}</span>
                        </div>

                        <div className="flex justify-between mt-2 text-lg font-semibold text-gray-900">
                            <span>Total</span>
                            <span>${pedido.total}</span>
                        </div>
                    </div>

                    <p className="text-center text-gray-600">
                        Te estaremos contactando por WhatsApp o email para coordinar la entrega.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
