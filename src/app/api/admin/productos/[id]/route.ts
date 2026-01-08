// src/app/api/admin/productos/[id]/route.ts
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

interface RouteParams {
    params: { id: string }
}

// PUT: actualizar producto + categorías
export async function PUT(req: NextRequest, { params }: RouteParams) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const productoId = Number(params.id)
    if (Number.isNaN(productoId)) {
        return NextResponse.json(
            { error: "ID de producto inválido." },
            { status: 400 }
        )
    }

    const body = await req.json()
    const {
        nombre,
        precio,
        stock,
        descripcionCorta,
        descripcionLarga,
        categoria,
        categoriaIds,
        activo,
        destacado,
        orden,
    } = body

    try {
        // 1) Actualizo los campos básicos del producto
        await prisma.producto.update({
            where: { id: productoId },
            data: {
                nombre,
                precio: Number(precio),
                stock: stock !== undefined ? Number(stock) : null,
                descripcionCorta,
                descripcionLarga,
                categoria,
                activo,
                destacado,
                orden,
            },
        })

        // 2) Manejo de categorías (tabla pivote)
        if (Array.isArray(categoriaIds)) {
            // Borro las relaciones viejas
            await prisma.productosCategorias.deleteMany({
                where: { productoId: productoId },
            })

            // Creo las nuevas
            if (categoriaIds.length > 0) {
                await prisma.productosCategorias.createMany({
                    data: categoriaIds.map((cid: number) => ({
                        productoId: productoId,
                        categoriaId: cid,
                    })),
                })
            }
        }

        // 3) Devuelvo el producto actualizado con las categorías
        const producto = await prisma.producto.findUnique({
            where: { id: productoId },
            include: {
                categorias: {
                    include: {
                        categoria: true,
                    },
                },
            },
        })

        return NextResponse.json({ ok: true, producto })
    } catch (error) {
        console.error("❌ Error actualizando producto:", error)
        return NextResponse.json(
            { error: "No se pudo actualizar el producto." },
            { status: 500 }
        )
    }
}
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json(
            { error: "No autorizado" },
            { status: 401 }
        )
    }

    const id = Number(params.id)
    if (Number.isNaN(id)) {
        return NextResponse.json(
            { error: "ID inválido" },
            { status: 400 }
        )
    }

    try {
        // 1) Desvinculo las ventas (PedidoItem) de este producto
        await prisma.pedidoItem.updateMany({
            where: { productoId: id },
            data: { productoId: null },
        })

        // 2) Borro las filas de la tabla pivote ProductosCategorias
        await prisma.productosCategorias.deleteMany({
            where: { productoId: id },
        })

        // 3) Ahora sí, borro el producto
        await prisma.producto.delete({
            where: { id },
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("❌ Error eliminando producto:", error)
        return NextResponse.json(
            { error: "Error interno al eliminar producto." },
            { status: 500 }
        )
    }
}
