import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ pedidoId: string }> }
) {
    try {
        const { pedidoId } = await params
        const id = Number(pedidoId)

        if (Number.isNaN(id)) {
            return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 })
        }

        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        })

        if (!user) {
            return NextResponse.json({ ok: false, error: "Usuario no encontrado" }, { status: 404 })
        }

        // Traer pedido del usuario
        const pedido = await prisma.pedido.findFirst({
            where: { id, userId: user.id },
            select: { id: true, estado: true, metodoPago: true },
        })

        if (!pedido) {
            return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        if (pedido.metodoPago !== "TRANSFERENCIA") {
            return NextResponse.json(
                { ok: false, error: "Este pedido no es por transferencia" },
                { status: 400 }
            )
        }

        // Si ya lo mandó antes, devolvemos ok igual (idempotente)
        if (pedido.estado === "transfer_proof_sent") {
            return NextResponse.json({ ok: true })
        }

        // Si está confirmado/cancelado, no tiene sentido “ya aboné”
        const bloqueados = new Set(["confirmado", "cancelled_expired", "cancelado"])
        if (bloqueados.has((pedido.estado || "").toLowerCase())) {
            return NextResponse.json(
                { ok: false, error: "Este pedido ya no admite esta acción" },
                { status: 400 }
            )
        }

        // ✅ Marcamos como “comprobante enviado”
        await prisma.pedido.update({
            where: { id: pedido.id },
            data: {
                estado: "transfer_proof_sent",
                adminSeenAt: null, // lo vuelve “nuevo” para vos en el panel
            },
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("❌ Error en /api/pedidos/[pedidoId]/ya-abone:", error)
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
    }
}
