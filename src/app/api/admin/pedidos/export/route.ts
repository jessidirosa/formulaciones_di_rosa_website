import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    const pedidos = await prisma.pedido.findMany({
        orderBy: { createdAt: "desc" },
    })

    const headers = [
        "id",
        "numero",
        "userId",
        "fechaCreacion",
        "estado",
        "metodoEnvio",
        "subtotal",
        "costoEnvio",
        "total",
        // ✅ Campos de cupones agregados
        "cuponCodigo",
        "cuponDescuento",

        "nombreCliente",
        "apellidoCliente",
        "emailCliente",
        "telefonoCliente",
        "dniCliente",

        "tipoEntrega",
        "direccion",
        "ciudad",
        "localidad",
        "provincia",
        "codigoPostal",
        "sucursalCorreo",
        "notasCliente",
        "fechaEstimadaEnvio",
    ]

    const rows = pedidos.map((p) => {
        // Usamos una aserción de tipo por si los campos son nuevos en el esquema
        const pedido = p as any;

        return [
            pedido.id,
            pedido.numero,
            pedido.userId ?? "",
            pedido.createdAt.toISOString(),
            pedido.estado,
            pedido.metodoEnvio,
            pedido.subtotal,
            pedido.costoEnvio,
            pedido.total,
            // ✅ Mapeo de cupones
            pedido.cuponCodigo ?? "",
            pedido.cuponDescuento ?? 0,

            pedido.nombreCliente ?? "",
            pedido.apellidoCliente ?? "",
            pedido.emailCliente ?? "",
            pedido.telefonoCliente ?? "",
            pedido.dniCliente ?? "",

            pedido.tipoEntrega ?? "",
            pedido.direccion ?? "",
            pedido.ciudad ?? "",
            pedido.localidad ?? "",
            pedido.provincia ?? "",
            pedido.codigoPostal ?? "",
            pedido.sucursalCorreo ?? "",
            pedido.notasCliente ?? "",
            pedido.fechaEstimadaEnvio
                ? pedido.fechaEstimadaEnvio.toISOString()
                : "",
        ]
    })

    // Agregamos el BOM (Byte Order Mark) para que Excel reconozca los acentos correctamente
    const BOM = "\uFEFF";
    const csvContent =
        headers.join(";") +
        "\n" +
        rows.map((row) => row.join(";")).join("\n");

    return new NextResponse(BOM + csvContent, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="pedidos_di_rosa.csv"',
        },
    })
}