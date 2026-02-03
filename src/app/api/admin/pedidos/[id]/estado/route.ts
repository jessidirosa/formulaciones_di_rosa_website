import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { emailPedidoConfirmado } from "@/lib/emailTemplates"

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // ✅ Cambiado a 'id' para coincidir con la carpeta [id]
) {
    try {
        const { estado } = await req.json()

        // 1. Extraemos el 'id' según el nombre de tu carpeta
        const params = await context.params
        const pedidoId = params.id
        const idNumerico = Number(pedidoId)

        // Log para que veas en la terminal que ahora sí llega bien
        console.log(`🚀 Procesando Pedido ID: ${idNumerico} | Nuevo Estado: ${estado}`)

        if (!idNumerico || isNaN(idNumerico)) {
            return NextResponse.json({ ok: false, error: "ID de pedido inválido" }, { status: 400 })
        }

        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!session || user?.role !== "ADMIN") {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 })
        }

        // 2. Buscamos el pedido
        const pedido = await prisma.pedido.findUnique({
            where: { id: idNumerico },
        })

        if (!pedido) {
            return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        // 3. Lógica de Cupón y Notificación (solo si pasa a confirmado)
        if (estado === "confirmado" && pedido.estado !== "confirmado") {
            const p = pedido as any
            if (p.cuponCodigo) {
                try {
                    await prisma.cupon.update({
                        where: { codigo: p.cuponCodigo },
                        data: { usos: { increment: 1 } }
                    })
                    console.log(`🎟️ Uso incrementado para cupón: ${p.cuponCodigo}`)
                } catch (err) {
                    console.error("⚠️ Error incrementando uso de cupón:", err)
                }
            }

            if (pedido.emailCliente) {
                const appUrl = process.env.APP_URL || "http://localhost:3000"
                try {
                    await sendEmail(
                        pedido.emailCliente,
                        "✅ Pago Acreditado - Di Rosa Formulaciones",
                        emailPedidoConfirmado({
                            nombre: pedido.nombreCliente || undefined,
                            pedidoNumero: pedido.numero,
                            linkEstado: `${appUrl}/pedido/${pedido.publicToken}`
                        })
                    )
                } catch (err) {
                    console.error("⚠️ Error enviando email:", err)
                }
            }
        }

        // 4. Actualización final del estado
        const pedidoActualizado = await prisma.pedido.update({
            where: { id: idNumerico },
            data: { estado }
        })

        return NextResponse.json({ ok: true, pedido: pedidoActualizado })

    } catch (error: any) {
        console.error("❌ Error Crítico en API:", error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}