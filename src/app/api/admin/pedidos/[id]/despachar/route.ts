import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { emailPedidoEnviado } from "@/lib/emailTemplates"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { trackingNumber, carrier } = await req.json()

    // 1. Definimos la URL de seguimiento según el correo
    let trackingUrl = ""
    if (carrier === "ANDREANI") {
        trackingUrl = `https://www.andreani.com/envio/${trackingNumber}`
    } else if (carrier === "CORREO_ARGENTINO") {
        trackingUrl = `https://www.correoargentino.com.ar/formularios/e-commerce/seguimiento?nro=${trackingNumber}`
    }

    try {
        const pedido = await prisma.pedido.update({
            where: { id: Number(id) },
            data: {
                estado: "enviado",
                trackingNumber,
                trackingUrl,
                shippedAt: new Date(),
            }
        })

        // 2. Enviamos el mail de "Pedido en camino"
        if (pedido.emailCliente) {
            await sendEmail(
                pedido.emailCliente,
                "🚚 ¡Tu pedido está en camino!",
                emailPedidoEnviado({
                    nombre: pedido.nombreCliente || "",
                    pedidoNumero: pedido.numero,
                    trackingNumber,
                    trackingUrl,
                    carrier
                })
            )
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}