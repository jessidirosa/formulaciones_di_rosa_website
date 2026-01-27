import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session || user?.role !== "ADMIN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const valorPorcentaje = parseFloat(body.porcentaje)
    const valorMonto = parseFloat(body.monto)

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Obtenemos todas las presentaciones (que es donde están los precios reales)
            const presentaciones = await tx.presentacion.findMany()

            for (const pres of presentaciones) {
                let nuevoPrecio = pres.precio

                // Aplicar porcentaje si se ingresó
                if (!isNaN(valorPorcentaje) && valorPorcentaje !== 0) {
                    nuevoPrecio = nuevoPrecio * (1 + valorPorcentaje / 100)
                }

                // Aplicar monto fijo si se ingresó
                if (!isNaN(valorMonto) && valorMonto !== 0) {
                    nuevoPrecio = nuevoPrecio + valorMonto
                }

                // 🔹 LÓGICA DE REDONDEO A MÚLTIPLOS DE 100
                // Ejemplo: 1249 -> 1200 | 1251 -> 1300
                const precioRedondeado = Math.round(nuevoPrecio / 100) * 100

                // 2. Actualizamos la presentación
                await tx.presentacion.update({
                    where: { id: pres.id },
                    data: { precio: precioRedondeado }
                })
            }
        })

        return NextResponse.json({ ok: true, message: "Catálogo actualizado con redondeo a 100" })
    } catch (error) {
        console.error("❌ Error en aumento masivo:", error)
        return NextResponse.json({ error: "Error al procesar el aumento masivo" }, { status: 500 })
    }
}