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

// GET: lista de productos (con categorías)
export async function GET() {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const productos = await prisma.producto.findMany({
        orderBy: { creadoEn: "desc" },
        include: {
            categorias: {
                include: {
                    categoria: true, // 👈 trae la info de la categoría real
                },
            },
        },
    })

    return NextResponse.json({ productos })
}

// POST: crear producto
export async function POST(req: NextRequest) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()

    const {
        nombre,
        slug,
        precio,
        categoria,           // texto simple opcional
        descripcionCorta,
        descripcionLarga,
        imagen,
        stock,
        activo,
        destacado,
        orden,
        categoriaIds,        // 👉 array de ids de Categoria
    } = body

    if (!nombre || precio === undefined || precio === null) {
        return NextResponse.json(
            { error: "Nombre y precio son obligatorios." },
            { status: 400 }
        )
    }

    const precioNumber = Number(precio)
    if (Number.isNaN(precioNumber)) {
        return NextResponse.json(
            { error: "El precio debe ser un número." },
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
        // 1) Creo el producto sin tocar la tabla pivote
        const productoCreado = await prisma.producto.create({
            data: {
                nombre,
                slug: finalSlug,
                precio: precioNumber,
                categoria: categoria || null,
                descripcionCorta: descripcionCorta || null,
                descripcionLarga: descripcionLarga || null,
                imagen: imagen || null,
                stock: stock !== undefined && stock !== null ? Number(stock) : 0,
                activo: activo ?? true,
                destacado: destacado ?? false,
                orden: orden ?? 0,
            },
        })

        // 2) Si hay categoriaIds, creo las filas en ProductosCategorias
        if (Array.isArray(categoriaIds) && categoriaIds.length > 0) {
            await prisma.productosCategorias.createMany({
                data: categoriaIds.map((id: number) => ({
                    productoId: productoCreado.id,
                    categoriaId: id,
                })),
            })
        }

        // 3) Vuelvo a leer el producto ya con sus categorías
        const producto = await prisma.producto.findUnique({
            where: { id: productoCreado.id },
            include: {
                categorias: {
                    include: {
                        categoria: true,
                    },
                },
            },
        })

        return NextResponse.json(
            { ok: true, producto },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("❌ Error creando producto:", error)
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Ya existe un producto con ese slug." },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: "Error interno al crear producto." },
            { status: 500 }
        )
    }
}
