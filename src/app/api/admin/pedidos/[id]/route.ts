import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const { items, total, subtotal } = await req.json();

    try {
        await prisma.$transaction([
            // 1. Borramos los items anteriores
            prisma.pedidoItem.deleteMany({
                where: { pedidoId: pedidoId }
            }),
            // 2. Creamos los nuevos (SOLO con los campos que existen en tu DB)
            prisma.pedidoItem.createMany({
                data: items.map((item: any) => ({
                    pedidoId: pedidoId,
                    productoId: item.productoId || null,
                    nombreProducto: item.nombreProducto,
                    cantidad: item.cantidad,
                    // Quitamos precioUnitario porque Prisma dice que no existe en tu modelo
                    subtotal: item.subtotal,
                })),
            }),
            // 3. Actualizamos el total y subtotal del pedido
            prisma.pedido.update({
                where: { id: pedidoId },
                data: {
                    total: total,
                    subtotal: subtotal
                }
            })
        ]);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error al actualizar pedido:", error);
        return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
}