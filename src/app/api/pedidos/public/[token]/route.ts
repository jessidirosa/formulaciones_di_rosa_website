import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { token: string } }) {
    const pedido = await prisma.pedido.findUnique({
        where: { publicToken: params.token },
        include: { items: true }
    })
    if (!pedido) return NextResponse.json({ ok: false }, { status: 404 })
    return NextResponse.json({ ok: true, pedido })
}