// src/app/api/admin/pedidos/[id]/estado/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const ESTADOS_VALIDOS = [
    "pendiente",
    "pagado",
    "en_produccion",
    "listo_envio",
    "enviado",
    "entregado",
    "cancelado",
]

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!session || user?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            )
        }

        const { estado } = await req.json()

        if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
            return NextResponse.json(
                { error: "Estado inválido" },
                { status: 400 }
            )
        }

        const pedidoId = Number(params.id)
        if (Number.isNaN(pedidoId)) {
            return NextResponse.json(
                { error: "ID de pedido inválido" },
                { status: 400 }
            )
        }

        const pedidoActualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { estado },
        })

        return NextResponse.json({
            ok: true,
            pedido: pedidoActualizado,
        })
    } catch (error) {
        console.error("❌ Error al actualizar estado del pedido:", error)
        return NextResponse.json(
            { error: "Error interno al actualizar el pedido." },
            { status: 500 }
        )
    }
}
