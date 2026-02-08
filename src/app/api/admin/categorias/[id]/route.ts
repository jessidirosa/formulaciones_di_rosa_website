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

// PATCH: Editar categoría
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const resolvedParams = await params
    const id = Number(resolvedParams.id)
    const { nombre, slug } = await req.json()

    if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    try {
        const categoria = await prisma.categoria.update({
            where: { id },
            data: {
                nombre,
                slug: slug.toLowerCase().trim().replace(/\s+/g, "-")
            },
        })
        return NextResponse.json({ ok: true, categoria })
    } catch (error) {
        console.error("❌ Error editando categoría:", error)
        return NextResponse.json({ error: "No se pudo editar la categoría." }, { status: 500 })
    }
}

// DELETE: Eliminar categoría (Limpia relaciones primero)
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const resolvedParams = await params
    const id = Number(resolvedParams.id)

    if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    try {
        // ✅ SOLUCIÓN AL ERROR DE ELIMINACIÓN:
        // Primero eliminamos las relaciones en la tabla pivot para evitar errores de Foreign Key
        await prisma.productosCategorias.deleteMany({
            where: { categoriaId: id }
        })

        // Ahora sí eliminamos la categoría
        await prisma.categoria.delete({
            where: { id },
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("❌ Error eliminando categoría:", error)
        return NextResponse.json(
            { error: "No se pudo eliminar. Asegurate de que no haya errores de servidor." },
            { status: 500 }
        )
    }
}