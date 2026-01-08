// src/app/api/productos/update-prices/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Redondeo inteligente: al múltiplo de 100 más cercano
function redondearInteligente(precio: number) {
    if (precio <= 0) return 0
    return Math.round(precio / 100) * 100
}

export async function POST(req: Request) {
    try {
        const { porcentaje, monto } = await req.json()

        if (!porcentaje && !monto) {
            return NextResponse.json(
                { error: "Debés enviar porcentaje o monto para ajustar precios." },
                { status: 400 }
            )
        }

        const productos = await prisma.producto.findMany()

        const updates = productos.map((prod) => {
            let nuevoPrecio = prod.precio

            if (porcentaje) {
                nuevoPrecio = nuevoPrecio * (1 + porcentaje / 100)
            }

            if (monto) {
                nuevoPrecio = nuevoPrecio + monto
            }

            const precioFinal = redondearInteligente(nuevoPrecio)

            return prisma.producto.update({
                where: { id: prod.id },
                data: { precio: precioFinal },
            })
        })

        await prisma.$transaction(updates)

        return NextResponse.json({
            ok: true,
            message: "Precios actualizados correctamente.",
            cantidad: productos.length,
        })
    } catch (error) {
        console.error("ERROR MASIVO DE PRECIOS:", error)
        return NextResponse.json(
            { error: "No se pudieron actualizar los precios." },
            { status: 500 }
        )
    }
}
