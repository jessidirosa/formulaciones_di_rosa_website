import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { token: string } }) {
    try {
        const pedido = await prisma.pedido.update({
            where: { publicToken: params.token },
            data: {
                estado: "transfer_proof_sent",
                transferProofSentAt: new Date(),
                transferProofStatus: "sent"
            }
        })
        return NextResponse.json({ ok: true, pedido })
    } catch (e) {
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}