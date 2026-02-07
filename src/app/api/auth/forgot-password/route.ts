import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            // Por seguridad, no decimos si el email existe o no
            return NextResponse.json({ ok: true, message: "Si el email existe, se enviará un enlace." })
        }

        const token = uuidv4()
        const expires = new Date(Date.now() + 3600000) // 1 hora de validez

        await prisma.passwordResetToken.create({
            data: { email, token, expires }
        })

        // AQUÍ SE ENVIARÍA EL EMAIL CON EL LINK:
        // https://formulacionesdirosa.vercel.app/mi-cuenta/restablecer?token=${token}
        console.log(`🔗 Link de recuperación para ${email}: http://localhost:3000/mi-cuenta/restablecer?token=${token}`)

        return NextResponse.json({ ok: true, message: "Enlace generado con éxito." })
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}