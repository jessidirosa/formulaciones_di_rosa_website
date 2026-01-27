import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Función de validación de administrador (Tal cual la tenías)
async function requireAdmin() {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session || user?.role !== "ADMIN") {
        return null
    }

    return { session, user }
}

// PUT: actualizar producto (incluyendo presentaciones y categorías)
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = parseInt(params.id)
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
        orden,
        categoriaIds,
        presentaciones // 👈 Recibimos el array de presentaciones
    } = body

    if (!nombre) {
        return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })
    }

    // Lógica de Slug (respetando tu formato original)
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
        // Usamos una transacción para que si algo falla, no se rompa la integridad de la DB
        const productoActualizado = await prisma.$transaction(async (tx) => {

            // 1) Borramos categorías actuales para este producto
            await tx.productosCategorias.deleteMany({
                where: { productoId: id }
            })

            // 2) Borramos presentaciones actuales para este producto (para reemplazarlas)
            await tx.presentacion.deleteMany({
                where: { productoId: id }
            })

            // 3) Actualizamos los datos principales del producto
            const actualizado = await tx.producto.update({
                where: { id },
                data: {
                    nombre,
                    slug: finalSlug,
                    precio: precio !== undefined ? Number(precio) : 0,
                    categoria: categoria || null,
                    descripcionCorta: descripcionCorta || null,
                    descripcionLarga: descripcionLarga || null,
                    imagen: imagen || null,
                    stock: stock !== undefined ? Number(stock) : 0,
                    activo: activo ?? true,
                    destacado: destacado ?? false,
                    orden: orden ?? 0,
                },
            })

            // 4) Re-creamos la relación con categorías si hay IDs
            if (Array.isArray(categoriaIds) && categoriaIds.length > 0) {
                await tx.productosCategorias.createMany({
                    data: categoriaIds.map((catId: number) => ({
                        productoId: id,
                        categoriaId: catId,
                    })),
                })
            }

            // 5) Creamos las nuevas presentaciones
            if (Array.isArray(presentaciones) && presentaciones.length > 0) {
                await tx.presentacion.createMany({
                    data: presentaciones.map((p: any) => ({
                        nombre: p.nombre,
                        precio: Number(p.precio),
                        stock: Number(p.stock),
                        productoId: id,
                    })),
                })
            }

            return actualizado
        })

        // 6) Buscamos el producto final con todo incluido para devolverlo al frontend
        const productoCompleto = await prisma.producto.findUnique({
            where: { id },
            include: {
                presentaciones: true,
                categorias: {
                    include: {
                        categoria: true,
                    },
                },
            },
        })

        return NextResponse.json({ ok: true, producto: productoCompleto })
    } catch (error: any) {
        console.error("❌ Error actualizando producto:", error)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Ese slug ya está en uso." }, { status: 409 })
        }
        return NextResponse.json({ error: "Error interno al actualizar." }, { status: 500 })
    }
}

// DELETE: eliminar producto (Prisma se encarga de las presentaciones por el Cascade en el schema)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
        const id = parseInt(params.id)
        await prisma.producto.delete({
            where: { id },
        })

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error("❌ Error eliminando producto:", error)
        return NextResponse.json({ error: "No se pudo eliminar el producto." }, { status: 500 })
    }
}