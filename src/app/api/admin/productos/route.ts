import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!session || user?.role !== "ADMIN") return null
    return { session, user }
}

export async function GET() {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const productos = await prisma.producto.findMany({
        orderBy: { creadoEn: "desc" },
        include: {
            presentaciones: true,
            categorias: {
                include: { categoria: true },
            },
        },
    })
    return NextResponse.json({ productos })
}

export async function POST(req: NextRequest) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const body = await req.json()
    const {
        nombre, slug, precio, categoria, descripcionCorta,
        descripcionLarga, imagen, stock, activo, destacado,
        orden, categoriaIds, presentaciones
    } = body

    if (!nombre || !presentaciones || presentaciones.length === 0) {
        return NextResponse.json({ error: "Nombre y al menos una presentación son obligatorios." }, { status: 400 })
    }

    let finalSlug = slug && String(slug).toLowerCase().trim().replace(/\s+/g, "-")
    if (!finalSlug) {
        finalSlug = String(nombre).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }

    try {
        const producto = await prisma.producto.create({
            data: {
                nombre,
                slug: finalSlug,
                precio: Number(precio) || 0,
                categoria: categoria || null,
                descripcionCorta: descripcionCorta || null,
                descripcionLarga: descripcionLarga || null,
                imagen: imagen || null,
                stock: Number(stock) || 0,
                activo: activo ?? true,
                destacado: destacado ?? false,
                orden: orden ?? 0,
                categorias: {
                    create: categoriaIds?.map((id: number) => ({
                        categoria: { connect: { id } }
                    }))
                },
                presentaciones: {
                    create: presentaciones.map((p: any) => ({
                        nombre: p.nombre,
                        precio: Number(p.precio),
                        stock: Number(p.stock)
                    }))
                }
            },
            include: {
                presentaciones: true,
                categorias: { include: { categoria: true } }
            }
        })

        return NextResponse.json({ ok: true, producto }, { status: 201 })
    } catch (error: any) {
        console.error("❌ Error:", error)
        return NextResponse.json({ error: "Error interno al crear producto." }, { status: 500 })
    }
}