import { NextRequest, NextResponse } from "next/server";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email";
import { emailNuevaConsultaAdmin } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);

        if (!body) {
            return NextResponse.json({ error: "No se recibieron datos" }, { status: 400 });
        }

        const { nombre, email, telefono, tipo, mensaje } = body;

        // Validación de campos obligatorios
        if (!nombre || !email || !telefono || !mensaje) {
            console.error("Faltan datos en el body:", body);
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        // Generamos el HTML incluyendo el nuevo campo teléfono
        const html = emailNuevaConsultaAdmin({ nombre, email, telefono, tipo, mensaje });

        // Enviamos el mail al admin
        await sendEmail(
            ADMIN_EMAIL,
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