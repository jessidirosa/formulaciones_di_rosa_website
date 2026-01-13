import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function buildWhatsAppUrl(to: string, message: string) {
    const clean = to.replace(/[^\d]/g, "") // saca +, espacios, guiones
    const text = encodeURIComponent(message)
    return `https://wa.me/${clean}?text=${text}`
}

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const pedidoId = Number(id)

        if (Number.isNaN(pedidoId)) {
            return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 })
        }

        const pedido = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { estado: "confirmado" },
            include: { items: true },
        })

        // 👇 tu número (el tuyo) en formato 54911...
        const adminTo = process.env.ADMIN_WHATSAPP_TO || ""

        const cantidadItems = pedido.items.reduce((acc, it) => acc + it.cantidad, 0)

        const message =
            `🟢 Pedido CONFIRMADO\n` +
            `#${pedido.id} (${pedido.numero})\n` +
            `Cliente: ${pedido.nombreCliente ?? ""} ${pedido.apellidoCliente ?? ""}\n` +
            `Total: $${pedido.total}\n` +
            `Items: ${cantidadItems}\n` +
            `Estado: ${pedido.estado}\n` +
            `🧾 Ver en admin: /admin/pedidos`

        const whatsappUrl = adminTo ? buildWhatsAppUrl(adminTo, message) : null

        return NextResponse.json({
            ok: true,
            pedido: { id: pedido.id, estado: pedido.estado },
            whatsappUrl,
        })
    } catch (e) {
        console.error("❌ Error confirmando pedido:", e)
        return NextResponse.json(
            { ok: false, error: "Error interno" },
            { status: 500 }
        )
    }
}
