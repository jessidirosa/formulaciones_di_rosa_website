import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> } // ✅ CAMBIO: Promise
) {
    try {
        // ✅ CAMBIO: await params
        const resolvedParams = await params
        const { token } = resolvedParams

        // Buscamos el pedido por el publicToken (que es el que recibimos como token en la URL)
        const pedido = await prisma.pedido.findUnique({
            where: { publicToken: token }
        })

        if (!pedido) {
            return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
        }

        // Actualizamos el estado a 'transfer_proof_sent' (o el que uses para avisos)
        await prisma.pedido.update({
            where: { id: pedido.id },
            data: { estado: "transfer_proof_sent" }
        })

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error("❌ Error en avisar-pago:", error.message)
        return NextResponse.json({ error: "Error al procesar el aviso" }, { status: 500 })
    }
}