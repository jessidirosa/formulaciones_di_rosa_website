import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session || user?.role !== "ADMIN") {
        return null
    }

    return { session, user }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ CAMBIO: Definido como Promise
) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // ✅ CAMBIO: Esperamos a que los params se resuelvan
    const resolvedParams = await params
    const id = Number(resolvedParams.id)

    if (Number.isNaN(id)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    try {
        await prisma.categoria.delete({
            where: { id },
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("❌ Error eliminando categoría:", error)
        return NextResponse.json(
            { error: "No se pudo eliminar la categoría." },
            { status: 500 }
        )
    }
}