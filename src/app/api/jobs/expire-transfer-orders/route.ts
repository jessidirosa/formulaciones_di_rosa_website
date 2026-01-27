import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { emailPagoExpirado } from "@/lib/emailTemplates"

export async function POST() {
    try {
        const now = new Date()
        const haceDosHoras = new Date(now.getTime() - 2 * 60 * 60 * 1000); // Resta 2 horas en milisegundos
        // 1. Buscamos los pedidos que están por expirar
        // En el Job de expiración
        const pedidosAExpirar = await prisma.pedido.findMany({
            where: {
                OR: [
                    { estado: "pending_payment_transfer", expiresAt: { lt: now } },
                    { estado: "pendiente_mercadopago", createdAt: { lt: haceDosHoras } } // 👈 Limpieza de MP
                ]
            }
        });

        if (pedidosAExpirar.length === 0) {
            return NextResponse.json({ ok: true, cancelled: 0 })
        }

        // 2. Procesamos cada pedido para enviar el email
        for (const pedido of pedidosAExpirar) {
            if (pedido.emailCliente) {
                try {
                    await sendEmail(
                        pedido.emailCliente,
                        `⏳ Pago Expirado - Orden #${pedido.numero}`,
                        emailPagoExpirado({
                            nombre: pedido.nombreCliente || undefined,
                            pedidoNumero: pedido.numero
                        })
                    )
                } catch (mailErr) {
                    console.error(`❌ Error enviando mail de expiración al pedido ${pedido.numero}:`, mailErr)
                }
            }
        }

        // 3. Marcamos todos como expirados en la DB
        const result = await prisma.pedido.updateMany({
            where: {
                id: { in: pedidosAExpirar.map(p => p.id) }
            },
            data: { estado: "cancelled_expired" },
        })

        console.log(`✅ Se expiraron automáticamente ${result.count} pedidos por falta de pago.`)

        return NextResponse.json({ ok: true, cancelled: result.count })
    } catch (error: any) {
        console.error("❌ Error en el Job de expiración:", error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}