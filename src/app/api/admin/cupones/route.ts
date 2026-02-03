import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any
        if (!session || user?.role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const data = await req.json()

        // Validar si el código ya existe
        const existente = await prisma.cupon.findUnique({
            where: { codigo: data.codigo }
        })

        if (existente) {
            return NextResponse.json({ error: "Este código de cupón ya existe" }, { status: 400 })
        }

        const cupon = await prisma.cupon.create({
            data: {
                codigo: data.codigo,
                descripcion: data.descripcion,
                tipo: data.tipo,
                valor: data.valor,
                montoMinimo: data.montoMinimo,
                limiteUsos: data.limiteUsos,
                fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
            }
        })

        return NextResponse.json({ ok: true, cupon })
    } catch (error: any) {
        console.error("❌ Error creando cupón:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}