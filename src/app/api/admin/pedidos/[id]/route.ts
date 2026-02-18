import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") return new NextResponse("No autorizado", { status: 401 });

    const { items, total, subtotal } = await req.json();

    try {
        await prisma.$transaction([
            // Borramos los items anteriores
            prisma.pedidoItem.deleteMany({ where: { pedidoId: Number(params.id) } }),
            // Creamos los nuevos (incluyendo los personalizados)
            prisma.pedidoItem.createMany({
                data: items.map((item: any) => ({
                    pedidoId: Number(params.id),
                    productoId: item.productoId || null, // null si es personalizado
                    nombreProducto: item.nombreProducto,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                    subtotal: item.subtotal,
                })),
            }),
            // Actualizamos el total del pedido
            prisma.pedido.update({
                where: { id: Number(params.id) },
                data: { total, subtotal }
            })
        ]);
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
}