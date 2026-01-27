import nodemailer from "nodemailer"

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT || 587)
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.EMAIL_FROM

// Aquí puedes dejar fijo tu email de admin para recibir avisos
export const ADMIN_EMAIL = "formulacionesdr@gmail.com"

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter() {
    if (cachedTransporter) return cachedTransporter
    if (!host || !user || !pass || !from) return null

    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass: pass.replace(/\s+/g, "") },
        requireTLS: port === 587,
    })
    return cachedTransporter
}

// 🔹 Aceptamos null para que no tire error de tipos
export async function sendEmail(to: string | null | undefined, subject: string, html: string) {
    const transporter = getTransporter()

    // Validación de seguridad para evitar el error de "null"
    if (!transporter || !from || !to) {
        console.warn("⚠️ Abortando envío: Transporter no configurado o falta destinatario.")
        return
    }

    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            html,
        })
        console.log(`✅ Email enviado exitosamente a: ${to}`)
    } catch (err: any) {
        console.error("❌ Error SMTP detallado:", err?.message)
    }
}