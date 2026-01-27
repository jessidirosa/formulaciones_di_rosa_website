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

    const rows = pedidos.map((p) => [
        p.id,
        p.numero,
        p.userId ?? "",
        p.createdAt.toISOString(),
        p.estado,
        p.metodoEnvio,
        p.subtotal,
        p.costoEnvio,
        p.total,

        p.nombreCliente ?? "",
        p.apellidoCliente ?? "",
        p.emailCliente ?? "",
        p.telefonoCliente ?? "",
        p.dniCliente ?? "",

        p.tipoEntrega ?? "",
        p.direccion ?? "",
        p.ciudad ?? "",
        p.localidad ?? "",
        p.provincia ?? "",
        p.codigoPostal ?? "",
        p.sucursalCorreo ?? "",
        p.notasCliente ?? "",
        p.fechaEstimadaEnvio
            ? p.fechaEstimadaEnvio.toISOString()
            : "",
    ])

    const csv =
        headers.join(";") +
        "\n" +
        rows.map((row) => row.join(";")).join("\n")

    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="pedidos.csv"',
        },
    })
}
