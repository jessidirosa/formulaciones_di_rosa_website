import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ NUEVO: Método GET para que el usuario pueda ver sus productos y rehacer el pedido
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("No autorizado", { status: 401 });
    }

    const resolvedParams = await params;
    const pedidoId = Number(resolvedParams.id);

    try {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
            include: {
                // Incluimos los items para que el botón de rehacer tenga qué cargar
                items: true,
                // Si tu relación en Prisma se llama PedidoItem, usá: PedidoItem: true
            }
        });

        if (!pedido) {
            return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
        }

        // Verificación de seguridad: solo el dueño o un ADMIN pueden verlo
        const isAdmin = (session.user as any).role === "ADMIN";
        if (pedido.userId !== (session.user as any).id && !isAdmin) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        return NextResponse.json(pedido);
    } catch (error) {
        console.error("Error al obtener detalle del pedido:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("No autorizado", { status: 401 });
    }

    const resolvedParams = await params;
    const pedidoId = Number(resolvedParams.id);

    const { items, total, subtotal, descuento, notasCliente, datosContacto } = await req.json();

    try {
        await prisma.$transaction([
            // 1. Borramos los items actuales
            prisma.pedidoItem.deleteMany({ where: { pedidoId } }),

            // 2. Creamos los nuevos items (incluyendo personalizados)
            prisma.pedidoItem.createMany({
                data: items.map((item: any) => ({
                    pedidoId: pedidoId,
                    productoId: item.productoId || null,
                    nombreProducto: item.nombreProducto,
                    cantidad: item.cantidad,
                    subtotal: item.subtotal,
                })),
            }),

            // 3. Actualizamos el pedido con TODA la información nueva
            prisma.pedido.update({
                where: { id: pedidoId },
                data: {
                    total: total,
                    subtotal: subtotal,
                    descuento: Number(descuento),
                    notasCliente: notasCliente,
                    nombreCliente: datosContacto.nombreCliente,
                    apellidoCliente: datosContacto.apellidoCliente,
                    emailCliente: datosContacto.emailCliente,
                    telefonoCliente: datosContacto.telefonoCliente,
                    direccion: datosContacto.direccion,
                    localidad: datosContacto.localidad,
                    // ✅ IMPORTANTE: Agregamos la sucursal aquí
                    sucursalCorreo: datosContacto.sucursalCorreo
                }
            })
        ]);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error al actualizar pedido:", error);
        return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
}