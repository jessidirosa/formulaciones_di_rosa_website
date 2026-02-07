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

        // 1. Buscamos el pedido primero para ver si es de un usuario o invitado
        const pedidoData = await prisma.pedido.findUnique({
            where: { id },
            select: {
                id: true,
                estado: true,
                metodoPago: true,
                userId: true
            },
        })

        if (!pedidoData) {
            return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        // 2. VALIDACIÓN DE SEGURIDAD
        if (pedidoData.userId !== null) {
            if (!session?.user?.email) {
                return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 })
            }

            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true },
            })

            if (!user || pedidoData.userId !== user.id) {
                return NextResponse.json({ ok: false, error: "No tienes permiso para modificar este pedido" }, { status: 403 })
            }
        }

        // 3. VALIDACIONES DE NEGOCIO
        if (pedidoData.metodoPago !== "TRANSFERENCIA") {
            return NextResponse.json(
                { ok: false, error: "Este pedido no es por transferencia" },
                { status: 400 }
            )
        }

        if (pedidoData.estado === "transfer_proof_sent") {
            return NextResponse.json({ ok: true })
        }

        const bloqueados = new Set(["confirmado", "cancelled_expired", "cancelado"])
        if (bloqueados.has((pedidoData.estado || "").toLowerCase())) {
            return NextResponse.json(
                { ok: false, error: "Este pedido ya no admite esta acción" },
                { status: 400 }
            )
        }

        // 4. ✅ Marcamos como “comprobante enviado” 
        // Eliminamos 'actualizadoEn' para evitar el error de tipos de Prisma
        await prisma.pedido.update({
            where: { id: pedidoData.id },
            data: {
                estado: "transfer_proof_sent",
                adminSeenAt: null,
            },
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("❌ Error en /api/pedidos/[pedidoId]/ya-abone:", error)
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
    }
}