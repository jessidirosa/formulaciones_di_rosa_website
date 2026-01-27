import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { obtenerPago } from "@/lib/mercadopago"
import { sendEmail, ADMIN_EMAIL } from "@/lib/email"
import { emailPedidoConfirmado, emailNuevoPedidoAdmin } from "@/lib/emailTemplates"

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)

        let type = searchParams.get("type")
        let dataId = searchParams.get("data.id")

        if (!type || !dataId) {
            const body = await req.json().catch(() => ({}))
            type = type || body.type
            dataId = dataId || body.data?.id
        }

        if (type === "payment" && dataId) {
            const pagoMP = await obtenerPago(dataId)
            const statusMP = pagoMP.status

            // ✅ Usamos el external_reference que enviamos en create-order (formato P-XXXXXX)
            const codigoPedido = pagoMP.external_reference

            if (statusMP === "approved" && codigoPedido) {
                // 1. Buscamos el pedido por su CÓDIGO (numero), no por ID
                const pedido = await prisma.pedido.findFirst({
                    where: { numero: codigoPedido },
                    include: { items: true }
                })

                // 2. Si el pedido existe y no está ya confirmado, procedemos
                if (pedido && pedido.estado !== "confirmado") {
                    const appUrl = process.env.APP_URL || "http://localhost:3000"

                    await prisma.pedido.update({
                        where: { id: pedido.id },
                        data: { estado: "confirmado" }
                    })

                    // 3. Notificamos al Cliente
                    if (pedido.emailCliente) {
                        await sendEmail(
                            pedido.emailCliente,
                            "✅ Pago Confirmado - Di Rosa Formulaciones",
                            emailPedidoConfirmado({
                                nombre: pedido.nombreCliente || undefined,
                                pedidoNumero: pedido.numero,
                                linkEstado: `${appUrl}/pedido/${pedido.publicToken}`
                            })
                        )
                    }

                    // 4. Notificamos al Administrador
                    await sendEmail(
                        ADMIN_EMAIL,
                        `💰 Venta COBRADA #${pedido.numero} (Mercado Pago)`,
                        emailNuevoPedidoAdmin({
                            pedidoNumero: pedido.numero,
                            cliente: `${pedido.nombreCliente} ${pedido.apellidoCliente}`,
                            total: pedido.total,
                            linkAdmin: `${appUrl}/admin/pedidos`
                        })
                    )

                    console.log(`✅ Pedido ${codigoPedido} confirmado vía Webhook.`)
                }
            }
        }

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error: any) {
        console.error("❌ Error en Webhook MP:", error.message)
        return NextResponse.json({ ok: false }, { status: 200 })
    }
}