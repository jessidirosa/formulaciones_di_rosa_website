import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    const capacidadSemanal = Number(process.env.CAPACIDAD_SEMANAL) || 17
    const pedidosPendientes = await prisma.pedido.count({ where: { estado: 'pendiente' } })

    const semanasNecesarias = Math.floor(pedidosPendientes / capacidadSemanal)
    const fechaEstimada = new Date()
    fechaEstimada.setDate(fechaEstimada.getDate() + semanasNecesarias * 7 + 3)

    return NextResponse.json({
        ok: true,
        fechaISO: fechaEstimada.toISOString(),
        fechaAR: fechaEstimada.toLocaleDateString('es-AR'),
    })
}
