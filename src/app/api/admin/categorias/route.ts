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

// GET: listar categorías
export async function GET() {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const categorias = await prisma.categoria.findMany({
        orderBy: { nombre: "asc" },
    })

    return NextResponse.json({ categorias })
}

// POST: crear categoría
export async function POST(req: NextRequest) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { nombre, slug } = await req.json()

    if (!nombre) {
        return NextResponse.json(
            { error: "El nombre es obligatorio." },
            { status: 400 }
        )
    }

    let finalSlug =
        slug &&
        String(slug)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")

    if (!finalSlug) {
        finalSlug = String(nombre)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
    }

    try {
        const categoria = await prisma.categoria.create({
            data: {
                nombre,
                slug: finalSlug,
            },
        })

        return NextResponse.json({ ok: true, categoria }, { status: 201 })
    } catch (error: any) {
        console.error("❌ Error creando categoría:", error)
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Ya existe una categoría con ese slug." },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: "Error interno al crear categoría." },
            { status: 500 }
        )
    }
}
