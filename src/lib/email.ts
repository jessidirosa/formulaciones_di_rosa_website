// src/lib/email.ts
import nodemailer from "nodemailer"

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT || 587)
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.EMAIL_FROM

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter() {
    if (cachedTransporter) return cachedTransporter

    if (!host || !user || !pass || !from) {
        console.warn("⚠️ SMTP env vars faltan. No se configuró transporter.")
        return null
    }

    // Importante: Gmail con 587 → secure=false + STARTTLS
    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass: pass.replace(/\s+/g, "") }, // por si pegaste la app password con espacios
        requireTLS: port === 587,
    })

    return cachedTransporter
}

export async function sendEmail(to: string, subject: string, html: string) {
    const transporter = getTransporter()
    if (!transporter || !from) {
        console.warn("⚠️ SMTP no configurado. No se envió email.")
        return
    }

    try {
        // opcional, pero te da un error más claro si auth está mal
        await transporter.verify()

        await transporter.sendMail({
            from,
            to,
            subject,
            html,
        })
    } catch (err: any) {
        console.error("❌ Error enviando email:", {
            message: err?.message,
            code: err?.code,
            response: err?.response,
            responseCode: err?.responseCode,
            command: err?.command,
        })
        throw err
    }
}
