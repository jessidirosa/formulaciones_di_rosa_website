import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json()

        // 1. Buscar el token en la DB
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        })

        if (!resetToken || resetToken.expires < new Date()) {
            return NextResponse.json({ error: "El enlace es inválido o ha expirado." }, { status: 400 })
        }

        // 2. Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 12)

        // 3. Actualizar al usuario y borrar el token (todo en una transacción)
        await prisma.$transaction([
            prisma.user.update({
                where: { email: resetToken.email },
                data: { passwordHash: hashedPassword }
            }),
            prisma.passwordResetToken.delete({
                where: { token }
            })
        ])

        return NextResponse.json({ ok: true, message: "Contraseña restablecida con éxito." })
    } catch (error) {
        console.error("❌ Error en reset-password:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}