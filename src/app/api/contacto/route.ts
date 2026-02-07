import { NextRequest, NextResponse } from "next/server";
import { emailNuevaConsultaAdmin } from "@/lib/emailTemplates";
import { sendEmail, CONTACT_EMAIL } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        // 1. Primero obtenemos los datos del formulario
        const body = await req.json().catch(() => null);

        if (!body) {
            return NextResponse.json({ error: "No se recibieron datos" }, { status: 400 });
        }

        const { nombre, email, telefono, tipo, mensaje } = body;

        // 2. Validación de campos obligatorios
        if (!nombre || !email || !telefono || !mensaje) {
            console.error("Faltan datos en el body:", body);
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        // 3. Generamos el HTML con la plantilla
        const html = emailNuevaConsultaAdmin({ nombre, email, telefono, tipo, mensaje });

        // 4. Enviamos el mail al mail de contacto (info@...)
        // Usamos CONTACT_EMAIL que definimos en lib/email.ts
        await sendEmail(
            CONTACT_EMAIL,
            `📩 Consulta Web: ${tipo} - ${nombre}`,
            html
        );

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error("❌ Error en API Contacto:", error.message);
        return NextResponse.json({
            error: "Error interno",
            details: error.message
        }, { status: 500 });
    }
}