import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // ... (mantené la validación de sesión y el resolvedParams igual)
    const resolvedParams = await params;
    const pedidoId = Number(resolvedParams.id);

    // ✅ Extraemos todas las variables nuevas del body
    const { items, total, subtotal, descuento, notasCliente, datosContacto } = await req.json();

    try {
        await prisma.$transaction([
            prisma.pedidoItem.deleteMany({ where: { pedidoId } }),
            prisma.pedidoItem.createMany({
                data: items.map((item: any) => ({
                    pedidoId: pedidoId,
                    productoId: item.productoId || null,
                    nombreProducto: item.nombreProducto,
                    cantidad: item.cantidad,
                    subtotal: item.subtotal,
                })),
            }),
            // ✅ Actualizamos el pedido con los nuevos campos
            prisma.pedido.update({
                where: { id: pedidoId },
                data: {
                    total: total,
                    subtotal: subtotal,
                    descuento: Number(descuento),
                    notasCliente: notasCliente,
                    // Esparcimos los datos de contacto
                    nombreCliente: datosContacto.nombreCliente,
                    apellidoCliente: datosContacto.apellidoCliente,
                    emailCliente: datosContacto.emailCliente,
                    telefonoCliente: datosContacto.telefonoCliente,
                    direccion: datosContacto.direccion,
                    localidad: datosContacto.localidad,
                }
            })
        ]);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error al actualizar pedido:", error);
        return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
}