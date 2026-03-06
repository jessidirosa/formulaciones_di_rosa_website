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
        const now = new Date()

        // 1. Mantenemos la lógica de expiración
        await prisma.pedido.updateMany({
            where: {
                id,
                metodoPago: "TRANSFERENCIA",
                estado: "pending_payment_transfer",
                expiresAt: { lt: now },
            },
            data: { estado: "cancelled_expired" },
        })

        // 2. Buscamos el pedido con sus ÍTEMS (importante para rehacer pedido)
        const pedidoData = await prisma.pedido.findUnique({
            where: { id },
            include: {
                items: true, // Traemos los productos del pedido
            }
        })

        if (!pedidoData) {
            return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        // 3. VALIDACIÓN DE SEGURIDAD REFORZADA
        // Si el pedido tiene un userId, verificamos que el que consulta sea el dueño o un ADMIN
        if (pedidoData.userId !== null) {
            if (!session?.user) {
                return NextResponse.json({ ok: false, error: "Deberás iniciar sesión para ver este pedido" }, { status: 401 })
            }

            const userSession = session.user as any;

            // Si no es el dueño Y tampoco es ADMIN, bloqueamos
            if (pedidoData.userId !== userSession.id && userSession.role !== "ADMIN") {
                return NextResponse.json({ ok: false, error: "No tienes permiso para ver este pedido" }, { status: 403 })
            }
        }
        // Si userId es null, significa que es un invitado. 
        // Permitimos el acceso ya que el pedidoId en la URL actúa como "token" de acceso.

        // Extraemos solo lo necesario para no devolver el userId al cliente
        const { userId, ...pedido } = pedidoData

        return NextResponse.json({ ok: true, pedido })
    } catch (error) {
        console.error("❌ Error en /api/pedidos/[pedidoId]:", error)
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
    }
}