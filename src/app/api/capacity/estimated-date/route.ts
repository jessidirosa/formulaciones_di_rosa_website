import { NextResponse } from "next/server"
import { calcularFechaEstimada, formatearRangoDeFecha } from "@/lib/capacity"

export async function GET() {
    try {
        // Usamos la lógica centralizada del lib
        const fecha = await calcularFechaEstimada()
        const rango = formatearRangoDeFecha(fecha)

        return NextResponse.json({
            ok: true,
            fecha: fecha.toISOString(),
            rangoTexto: rango
        })
    } catch (error) {
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}