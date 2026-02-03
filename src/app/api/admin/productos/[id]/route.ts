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

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // 👈 Definimos params como Promesa
) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    // 1. SOLUCIÓN AL ERROR DE LA IMAGEN: Esperamos a que los params se resuelvan
    const resolvedParams = await params;
    const idProductoTarget = parseInt(resolvedParams.id);

    if (isNaN(idProductoTarget)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await req.json()

    const {
        nombre,
        slug,
        precio,
        categoria,
        descripcionCorta,
        descripcionLarga,
        imagen,
        stock,
        activo,
        destacado,
        categoriaIds,
        presentaciones
    } = body

    if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })

    let finalSlug = slug && String(slug).toLowerCase().trim().replace(/\s+/g, "-")
    if (!finalSlug) {
        finalSlug = String(nombre).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }

    try {
        await prisma.$transaction(async (tx) => {
            // A. Borramos relaciones viejas
            await tx.productosCategorias.deleteMany({
                where: { productoId: idProductoTarget }
            })

            await tx.presentacion.deleteMany({
                where: { productoId: idProductoTarget }
            })

            // B. Actualizamos datos principales
            await tx.producto.update({
                where: { id: idProductoTarget },
                data: {
                    nombre,
                    slug: finalSlug,
                    precio: parseFloat(precio) || 0,
                    categoria: categoria || null,
                    descripcionCorta: descripcionCorta || null,
                    descripcionLarga: descripcionLarga || null,
                    imagen: imagen || null,
                    stock: parseInt(stock) || 0,
                    activo: activo ?? true,
                    destacado: destacado ?? false,
                },
            })

            // C. Recreamos Categorías
            if (Array.isArray(categoriaIds) && categoriaIds.length > 0) {
                await tx.productosCategorias.createMany({
                    data: categoriaIds.map((cId: any) => ({
                        productoId: idProductoTarget,
                        categoriaId: parseInt(cId),
                    })),
                })
            }

            // D. Recreamos Presentaciones
            if (Array.isArray(presentaciones) && presentaciones.length > 0) {
                await tx.presentacion.createMany({
                    data: presentaciones.map((p: any) => ({
                        nombre: String(p.nombre),
                        precio: parseFloat(p.precio) || 0,
                        stock: parseInt(p.stock) || 0,
                        productoId: idProductoTarget,
                    })),
                })
            }
        })

        const productoActualizado = await prisma.producto.findUnique({
            where: { id: idProductoTarget },
            include: {
                presentaciones: true,
                categorias: {
                    include: {
                        categoria: true,
                    },
                },
            },
        })

        return NextResponse.json({ ok: true, producto: productoActualizado })

    } catch (error: any) {
        console.error("❌ Error en PUT Producto:", error)
        return NextResponse.json({
            error: "Error en la base de datos",
            message: error.message
        }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // 👈 También corregimos aquí
) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        await prisma.producto.delete({ where: { id } })
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 })
    }
}