import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generarRotuloYTracking } from "@/lib/shipping"
import { sendEmail } from "@/lib/email"
import { emailPedidoEnviado } from "@/lib/emailTemplates"

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const pedidoId = Number(id)

        const session = await getServerSession(authOptions)
        const user = session?.user as any
        if (!session || user?.role !== "ADMIN") {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 })
        }

        const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
        if (!pedido) return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })


        // 1. Identificar el tipo de entrega
        const esSucursal = pedido.tipoEntrega === "SUCURSAL_CORREO" || !!pedido.sucursalId;
        const esRetiroLocal = pedido.metodoEnvio?.toLowerCase().includes("local");

        // 2. Aplicar validación según el tipo (SOLO UNA VEZ)
        if (esRetiroLocal) {
            return NextResponse.json({ ok: false, error: "No se genera rótulo para retiro en local." }, { status: 400 });
        }

        if (esSucursal) {
            // 🔹 FLEXIBILIDAD: Si no hay ID pero hay nombre, permitimos continuar
            // Algunos carriers permiten buscar la sucursal por nombre o CP si el ID falla
            if (!pedido.sucursalId && !pedido.sucursalNombre) {
                return NextResponse.json({
                    ok: false,
                    error: "Faltan datos de la sucursal (se requiere ID o Nombre de sucursal)."
                }, { status: 400 });
            }
        } else {
            if (!pedido.direccion || !pedido.ciudad || !pedido.provincia) {
                return NextResponse.json({
                    ok: false,
                    error: "Faltan datos de domicilio (Calle/Ciudad/Provincia)."
                }, { status: 400 });
            }
        }

        // 3. Proceder con el servicio de shipping
        const result = await generarRotuloYTracking(pedido)

        const updated = await prisma.pedido.update({
            where: { id: pedidoId },
            data: {
                trackingNumber: result.trackingNumber,
                trackingUrl: result.trackingUrl,
                labelUrl: (result as any).labelUrl || null,
                estado: "enviado",
                shippedAt: new Date(),
            },
        })

        try {
            if (updated.emailCliente) {
                await sendEmail(
                    updated.emailCliente,
                    "🚚 ¡Tu pedido Di Rosa está en camino!",
                    emailPedidoEnviado({
                        nombre: updated.nombreCliente || "",
                        pedidoNumero: updated.numero,
                        trackingNumber: updated.trackingNumber,
                        trackingUrl: updated.trackingUrl,
                        carrier: updated.carrier
                    })
                )
            }
        } catch (emailErr) {
            console.error("⚠️ Error al enviar mail de despacho:", emailErr)
        }

        return NextResponse.json({ ok: true, pedido: updated })
    } catch (e: any) {
        console.error("❌ generar-rotulo:", e)
        return NextResponse.json({ ok: false, error: e.message || "Error interno" }, { status: 500 })
    }
}