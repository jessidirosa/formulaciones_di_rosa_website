import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PATCH para activar/desactivar
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { activo } = await req.json()

    await prisma.cupon.update({
        where: { id: Number(id) },
        data: { activo }
    })
    return NextResponse.json({ ok: true })
}

// DELETE para eliminar
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await prisma.cupon.delete({
        where: { id: Number(id) }
    })
    return NextResponse.json({ ok: true })
}