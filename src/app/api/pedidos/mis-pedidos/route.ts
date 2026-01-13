// src/app/api/pedidos/mis-pedidos/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(_req: NextRequest) {
    try {
        // 1) Obtener sesión actual
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { pedidos: [], error: "No autenticado" },
                { status: 401 }
            )
        }

        // 2) Buscar el usuario por email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        })

        if (!user) {
            return NextResponse.json(
                { pedidos: [], error: "Usuario no encontrado" },
                { status: 404 }
            )
        }

        const now = new Date()

        await prisma.pedido.updateMany({
            where: {
                metodoPago: "TRANSFERENCIA",
                estado: "pending_payment_transfer",
                expiresAt: { lt: now },
            },
            data: { estado: "cancelled_expired" },
        })

        // 3) Traer pedidos de ese usuario
        const pedidos = await prisma.pedido.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                items: true,
            },
        })

        // 4) Adaptar al formato que espera tu MiCuentaPage
        const mapped = pedidos.map((p) => {
            const estado = (p.estado || "").toUpperCase()

            // Estado de pago “humano”
            let estadoPago = "PENDIENTE"
            if (estado === "PAGADO" || estado === "CONFIRMADO") estadoPago = "PAGADO"
            if (estado === "CANCELADO" || estado === "CANCELLED_EXPIRED") estadoPago = "CANCELADO"
            if (estado === "TRANSFER_PROOF_SENT") estadoPago = "EN_REVISION"

            return {
                id: p.id.toString(),
                publicToken: p.publicToken ?? null,
                numero: p.numero,
                fechaCreacion: p.createdAt.toISOString(),
                estado: p.estado,
                estadoPago,
                total: p.total,
                cantidadItems: p.items.reduce((acc, item) => acc + item.cantidad, 0),
                fechaEstimadaEnvio: p.fechaEstimadaEnvio ? p.fechaEstimadaEnvio.toISOString() : null,
            }
        })


        return NextResponse.json({ pedidos: mapped })
    } catch (error) {
        console.error("❌ Error en /api/pedidos/mis-pedidos:", error)
        return NextResponse.json(
            {
                pedidos: [],
                error: "Error interno al cargar los pedidos",
            },
            { status: 500 }
        )
    }
}
