import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { action } = await req.json()

    if (action === "incrementar") {
        // Incrementamos el salto manual
        await prisma.config.upsert({
            where: { id: 1 },
            update: { semanasDesplazadas: { increment: 1 } },
            create: { id: 1, semanasDesplazadas: 1 }
        })
    } else if (action === "resetear") {
        // El reset manual ahora pone el contador en 0. 
        // La lógica de capacity.ts se encargará de buscar la primera semana 
        // que tenga cupo disponible (>= 0 de hoy) automáticamente.
        await prisma.config.update({
            where: { id: 1 },
            data: { semanasDesplazadas: 0 }
        })
    }

    return NextResponse.json({ ok: true })
}