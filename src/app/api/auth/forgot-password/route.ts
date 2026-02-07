import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { randomUUID } from "crypto"
import nodemailer from "nodemailer" // Importamos la librería que ya usas

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json({ ok: true, message: "Si el email existe, se enviará un enlace." })
        }

        const token = randomUUID()
        const expires = new Date(Date.now() + 3600000)

        await prisma.passwordResetToken.upsert({
            where: { email_token: { email, token } },
            update: { token, expires },
            create: { email, token, expires }
        })

        // CONFIGURACIÓN DEL TRANSPORTE (Usa las mismas variables que tus otros correos)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER, // Tu cuenta de Gmail
                pass: process.env.SMTP_PASS, // Tu contraseña de aplicación
            },
        })

        const resetUrl = `${process.env.NEXTAUTH_URL}/mi-cuenta/restablecer?token=${token}`

        // CUERPO DEL EMAIL
        const mailOptions = {
            from: `"Laboratorio Di Rosa" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Restablecer contraseña - Laboratorio Di Rosa",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #E9E9E0; padding: 20px; border-radius: 20px;">
          <h2 style="color: #4A5D45; text-align: center;">Laboratorio Di Rosa</h2>
          <p>Hola, <strong>${user.nombre}</strong>.</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el siguiente botón para continuar:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4A5D45; color: #F5F5F0; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px;">RESTABLECER MI CONTRASEÑA</a>
          </div>
          <p style="font-size: 12px; color: #5B6350;">Si no solicitaste este cambio, podés ignorar este correo de forma segura. El enlace expirará en 1 hora.</p>
          <hr style="border: none; border-top: 1px solid #F5F5F0; margin-top: 20px;" />
          <p style="font-size: 10px; color: #A3B18A; text-align: center; text-transform: uppercase;">Formulaciones Magistrales & Naturales</p>
        </div>
      `,
        }

        // ENVÍO REAL
        await transporter.sendMail(mailOptions)

        return NextResponse.json({ ok: true, message: "Email enviado con éxito." })
    } catch (error) {
        console.error("❌ Error enviando mail de recuperación:", error)
        return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 500 })
    }
}