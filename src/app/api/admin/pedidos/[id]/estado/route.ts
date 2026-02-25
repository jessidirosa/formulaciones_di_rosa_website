import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import {
    emailPedidoConfirmado,
    emailEnProduccion,
    emailPedidoListo,
    emailPedidoCancelado
} from "@/lib/emailTemplates"

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { estado } = await req.json()

        const params = await context.params
        const pedidoId = params.id
        const idNumerico = Number(pedidoId)

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

        const appUrl = process.env.APP_URL || "http://localhost:3000"
        const emailCliente = pedido.emailCliente

        // 3. Lógica de Notificaciones según cambio de estado
        if (estado !== pedido.estado && emailCliente) {

            // --- ESTADO: CONFIRMADO ---
            if (estado === "confirmado") {
                const p = pedido as any
                if (p.cuponCodigo) {
                    try {
                        await prisma.cupon.update({
                            where: { codigo: p.cuponCodigo },
                            data: { usos: { increment: 1 } }
                        })
                    } catch (err) {
                        console.error("⚠️ Error cupón:", err)
                    }
                }

                await sendEmail(
                    emailCliente,
                    "✅ Pago Acreditado - Di Rosa Formulaciones",
                    emailPedidoConfirmado({
                        nombre: pedido.nombreCliente || undefined,
                        pedidoNumero: pedido.numero,
                        linkEstado: `${appUrl}/pedido/${pedido.publicToken}`
                    })
                ).catch(err => console.error("Error email confirmado:", err))
            }

            // --- ESTADO: EN PRODUCCIÓN ---
            else if (estado === "en_produccion") {
                await sendEmail(
                    emailCliente,
                    "🧪 Tu pedido entró a Laboratorio - Di Rosa Formulaciones",
                    emailEnProduccion({
                        nombre: pedido.nombreCliente || undefined,
                        pedidoNumero: pedido.numero,
                        linkEstado: `${appUrl}/pedido/${pedido.publicToken}`
                    })
                ).catch(err => console.error("Error email producción:", err))
            }

            // --- ESTADO: LISTO PARA ENVÍO / RETIRO ---
            else if (estado === "listo_envio") {
                const esRetiro = pedido.tipoEntrega === "RETIRO_LOCAL" || pedido.metodoEnvio === "RETIRO_LOCAL";

                if (esRetiro) {
                    // Email personalizado para Retiro Local
                    await sendEmail(
                        emailCliente,
                        "✨ ¡Tu pedido está listo para retirar! - Di Rosa Formulaciones",
                        `<div style="font-family:sans-serif; color:#3A4031; line-height:1.6;">
                            <h2 style="color:#4A5D45;">¡Hola ${pedido.nombreCliente || ""}!</h2>
                            <p>Tus productos ya están listos. Tu pedido <b>#${pedido.numero}</b> ha finalizado su etapa de elaboración.</p>
                            <p><b>¿Cómo sigue esto?</b> Nos vamos a estar comunicando con vos por WhatsApp para coordinar la entrega en nuestro punto de retiro.</p>
                            <div style="margin-top:25px; text-align:center;">
                                <a href="${appUrl}/pedido/${pedido.publicToken}" style="background:#4A5D45; color:white; padding:12px 25px; text-decoration:none; border-radius:12px; font-weight:bold; display:inline-block;">VER ESTADO DE MI PEDIDO</a>
                            </div>
                        </div>`
                    ).catch(err => console.error("Error email listo retiro:", err))
                } else {
                    // Email estándar para despacho por correo
                    await sendEmail(
                        emailCliente,
                        "✨ ¡Pedido Finalizado! - Di Rosa Formulaciones",
                        emailPedidoListo({
                            nombre: pedido.nombreCliente || undefined,
                            pedidoNumero: pedido.numero,
                            linkEstado: `${appUrl}/pedido/${pedido.publicToken}`
                        })
                    ).catch(err => console.error("Error email listo envío:", err))
                }
            }

            // --- ESTADO: CANCELADO ---
            else if (estado === "cancelado") {
                await sendEmail(
                    emailCliente,
                    "❌ Pedido Cancelado - Di Rosa Formulaciones",
                    emailPedidoCancelado({
                        nombre: pedido.nombreCliente || undefined,
                        pedidoNumero: pedido.numero
                    })
                ).catch(err => console.error("Error email cancelado:", err))
            }
        }

        // 4. Actualización final del estado en la base de datos
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