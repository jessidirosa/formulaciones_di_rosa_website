import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
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

        const now = new Date()

        // Mantenemos la lógica de expiración para actualizar el estado antes de devolverlo
        await prisma.pedido.updateMany({
            where: {
                id,
                metodoPago: "TRANSFERENCIA",
                estado: "pending_payment_transfer",
                expiresAt: { lt: now },
            },
            data: { estado: "cancelled_expired" },
        })

        const pedido = await prisma.pedido.findFirst({
            where: { id, userId: user.id },
            select: {
                id: true,
                numero: true, // ✅ Agregado: para que el cliente vea el ID institucional (P-...)
                total: true,
                descuento: true,
                estado: true,
                expiresAt: true,
            },
        })

        if (!pedido) {
            return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        return NextResponse.json({ ok: true, pedido })
    } catch (error) {
        console.error("❌ Error en /api/pedidos/[pedidoId]:", error)
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
    }
}