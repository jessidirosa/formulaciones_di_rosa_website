import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function calcularFechaEstimada(pedidosPendientes: number) {
    const capacidadSemanal = Number(process.env.CAPACIDAD_SEMANAL) || 17
    const semanasNecesarias = Math.floor(pedidosPendientes / capacidadSemanal)

    const fecha = new Date()
    fecha.setDate(fecha.getDate() + semanasNecesarias * 7 + 3)
    return fecha
}

export async function GET() {
    const pedidosPendientes = await prisma.pedido.count({
        where: { estado: "pendiente" },
    })

    const fecha = calcularFechaEstimada(pedidosPendientes)
    return NextResponse.json({ fechaEstimada: fecha.toISOString() })
}
