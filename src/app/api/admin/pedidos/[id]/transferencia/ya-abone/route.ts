import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(_req: NextRequest, { params }: { params: any }) {
    try {
        const p = await params
        const id = Number(p?.id)

        if (Number.isNaN(id)) {
            return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 })
        }

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            select: { id: true, estado: true, metodoPago: true },
        })

        if (!pedido) {
            return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        if ((pedido.metodoPago || "").toUpperCase() !== "TRANSFERENCIA") {
            return NextResponse.json({ ok: false, error: "Este pedido no es por transferencia" }, { status: 400 })
        }

        // ✅ Solo si estaba esperando pago
        if (pedido.estado !== "pending_payment_transfer") {
            return NextResponse.json({
                ok: true,
                already: true,
                message: "Este pedido ya no está pendiente de transferencia",
            })
        }

        await prisma.pedido.update({
            where: { id },
            data: { estado: "transfer_proof_sent" }, // ✅ SOLO esto, sin campos extra
        })

        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error("❌ Error ya-abone:", e)
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
    }
}
