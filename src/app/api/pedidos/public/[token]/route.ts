import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        // 1. Resolvemos los params (Requerido en versiones nuevas de Next.js)
        const { token } = await params

        if (!token) {
            return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 })
        }

        // 2. Buscamos el pedido usando el campo exacto: publicToken
        const pedido = await prisma.pedido.findUnique({
            where: {
                publicToken: token // ✅ Corregido según tu schema
            },
            include: {
                items: true
            }
        })

        // 3. Manejo de error si no existe
        if (!pedido) {
            return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        // 4. Respuesta exitosa
        return NextResponse.json({ ok: true, pedido })

    } catch (error: any) {
        console.error("❌ Error en API Pedido Public:", error)
        return NextResponse.json({
            ok: false,
            error: "Error interno del servidor",
            details: error.message
        }, { status: 500 })
    }
}