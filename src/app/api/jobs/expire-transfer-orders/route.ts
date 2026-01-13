import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST() {
    const now = new Date()

    const result = await prisma.pedido.updateMany({
        where: {
            metodoPago: "TRANSFERENCIA",
            estado: "pending_payment_transfer", // ✅ solo este estado expira
            expiresAt: { lt: now },
        },
        data: { estado: "cancelled_expired" },
    })

    return NextResponse.json({ ok: true, cancelled: result.count })
}
