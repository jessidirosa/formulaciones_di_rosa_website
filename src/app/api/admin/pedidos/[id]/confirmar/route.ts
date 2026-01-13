import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { emailPedidoConfirmado } from "@/lib/emailTemplates"

export async function POST(_req: NextRequest, { params }: { params: any }) {
    try {
        const p = await params
        const raw = p?.id
        const id = Number(raw)

        if (Number.isNaN(id)) {
            return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 })
        }

        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 })
        }

        const role = (session as any)?.user?.role
        if (role !== "ADMIN") {
            return NextResponse.json({ ok: false, error: "Sin permisos" }, { status: 403 })
        }

        // ✅ select: campos + relación items
        const pedido = await prisma.pedido.update({
            where: { id },
            data: { estado: "confirmado" },
            select: {
                id: true,
                numero: true,
                publicToken: true,
                estado: true,
                emailCliente: true,
                nombreCliente: true,
                apellidoCliente: true,
                total: true,
                items: {
                    select: {
                        nombreProducto: true,
                        cantidad: true,
                        subtotal: true,
                    },
                },
                confirmedEmailSentAt: true,

            },
        })

        // ✅ Email “confirmado” (no rompe el flujo si falla)
        try {
            const appUrl = process.env.APP_URL || "http://localhost:3000"
            const linkEstado = pedido.publicToken
                ? `${appUrl}/pedido/${pedido.publicToken}`
                : `${appUrl}/mi-cuenta`

            const emailItems = pedido.items.map((it) => ({
                nombre: it.nombreProducto,
                cantidad: it.cantidad,
                subtotal: it.subtotal,
            }))

            if (pedido.confirmedEmailSentAt) return NextResponse.json({ ok: true, pedido })

            if (pedido.emailCliente) {
                await sendEmail(
                    pedido.emailCliente,
                    "Pedido confirmado - Di Rosa Formulaciones",
                    emailPedidoConfirmado({
                        nombre: pedido.nombreCliente || undefined,
                        pedidoNumero: pedido.numero,
                        linkEstado,
                        items: emailItems,
                        total: pedido.total,
                    })
                )

                await prisma.pedido.update({
                    where: { id: pedido.id },
                    data: { confirmedEmailSentAt: new Date() },
                })
            }
        } catch (e) {
            console.error("⚠️ Falló el email de pedido confirmado (no se corta la confirmación):", e)
        }

        return NextResponse.json({ ok: true, pedido })
    } catch (e) {
        console.error("❌ Error confirmando pedido:", e)
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
    }
}
