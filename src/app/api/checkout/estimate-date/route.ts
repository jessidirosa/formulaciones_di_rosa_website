// app/api/capacity/estimated-date/route.ts (y los otros similares)
import { NextResponse } from "next/server"
import { calcularFechaEstimada, formatearRangoDeFecha } from "@/lib/capacity"

export async function GET() {
    const fecha = await calcularFechaEstimada()
    const rango = formatearRangoDeFecha(fecha)

    return NextResponse.json({
        fecha: fecha.toISOString(),
        rangoTexto: rango
    })
}