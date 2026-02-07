import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { randomUUID } from "crypto"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            // Mantenemos el mensaje genérico por seguridad
            return NextResponse.json({ ok: true, message: "Si el email existe, se enviará un enlace." })
        }

        const token = randomUUID()
        const expires = new Date(Date.now() + 3600000) // 1 hora de validez

        // Guardamos/Actualizamos el token en la base de datos
        await prisma.passwordResetToken.upsert({
            where: { email_token: { email, token } },
            update: { token, expires },
            create: { email, token, expires }
        })

        // CONFIGURACIÓN DEL TRANSPORTE (Usando tus variables SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        // URL para el botón (Asegurate que NEXTAUTH_URL sea https://tudominio.vercel.app en producción)
        const resetUrl = `${process.env.NEXTAUTH_URL}/mi-cuenta/restablecer?token=${token}`

        // CUERPO DEL EMAIL CON ESTÉTICA DI ROSA
        const mailOptions = {
            from: `"Laboratorio Di Rosa" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Restablecer contraseña - Laboratorio Di Rosa",
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #E9E9E0; padding: 40px; border-radius: 30px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3A4031; margin: 0; font-size: 24px; text-transform: uppercase; tracking: 2px;">Laboratorio Di Rosa</h1>
            <p style="color: #A3B18A; font-style: italic; margin-top: 5px;">Formulaciones Magistrales</p>
          </div>
          
          <p style="color: #3A4031; font-size: 16px;">Hola, <strong>${user.nombre}</strong>.</p>
          
          <p style="color: #5B6350; line-height: 1.6;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste vos, podés ignorar este correo.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background-color: #4A5D45; color: #F5F5F0; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 13px; display: inline-block; letter-spacing: 1px;">RESTABLECER CONTRASEÑA</a>
          </div>
          
          <p style="font-size: 11px; color: #A3B18A; text-align: center; margin-top: 40px;">
            Este enlace expirará en 60 minutos.<br>
            © 2026 Laboratorio Di Rosa. Todos los derechos reservados.
          </p>
        </div>
      `,
        }

        // ENVÍO
        await transporter.sendMail(mailOptions)

        return NextResponse.json({ ok: true, message: "Email enviado con éxito." })
    } catch (error) {
        console.error("❌ Error en forgot-password API:", error)
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
    }
}