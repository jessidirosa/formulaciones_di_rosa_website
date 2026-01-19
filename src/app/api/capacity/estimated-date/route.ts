// src/app/api/capacity/estimated-date/route.ts
import { NextResponse } from "next/server"
import {
    calcularFechaEstimada,
    formatearFechaArgentina,
    formatearFechaCompleta,
    CAPACIDAD_SEMANAL,
} from "@/lib/capacity"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
    try {
        const fecha = await calcularFechaEstimada()

        return NextResponse.json({
            ok: true,
            // ISO para guardar/usar internamente si querés
            iso: fecha.toISOString(),
            // Para UI (carrito/checkout)
            formatted: formatearFechaArgentina(fecha),
            formattedLong: formatearFechaCompleta(fecha),
            capacidadSemanal: CAPACIDAD_SEMANAL,
        })
    } catch (error) {
        console.error("❌ Error /api/capacity/estimated-date:", error)
        return NextResponse.json(
            { ok: false, error: "No se pudo calcular la fecha estimada." },
            { status: 500 }
        )
    }
}
