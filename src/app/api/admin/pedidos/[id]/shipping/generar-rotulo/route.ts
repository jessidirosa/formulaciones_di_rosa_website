import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ CAMBIO: Promise
) {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session || user?.role !== "ADMIN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
        // ✅ CAMBIO: await params
        const resolvedParams = await params
        const id = parseInt(resolvedParams.id)

        if (isNaN(id)) {
            return NextResponse.json({ error: "ID de pedido inválido" }, { status: 400 })
        }

        // Aquí iría tu lógica actual de buscar el pedido y generar el rótulo
        const pedido = await prisma.pedido.update({
            where: { id },
            data: {
                // ... tus datos actuales (ej: rotuloGenerado: true)
            }
        })

        return NextResponse.json({ ok: true, pedido })

    } catch (error: any) {
        console.error("❌ Error generando rótulo:", error.message)
        return NextResponse.json({ error: "No se pudo generar el rótulo" }, { status: 500 })
    }
}