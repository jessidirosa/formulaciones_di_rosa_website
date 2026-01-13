import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getProvider } from "@/lib/shipping"
import type { Carrier } from "@/lib/shipping/providers/types"

export async function POST(_req: NextRequest, { params }: { params: any }) {
    try {
        const id = Number(params?.id)
        if (Number.isNaN(id)) {
            return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 })
        }

        const session = await getServerSession(authOptions)
        const role = (session as any)?.user?.role
        if (!session?.user?.email) return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 })
        if (role !== "ADMIN") return NextResponse.json({ ok: false, error: "Sin permisos" }, { status: 403 })

        const pedido = await prisma.pedido.findUnique({ where: { id } })
        if (!pedido) return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 })

        // Validaciones mínimas para shipping
        if (!pedido.direccion || !pedido.ciudad || !pedido.provincia || !pedido.codigoPostal) {
            return NextResponse.json(
                { ok: false, error: "Faltan datos de envío (dirección/ciudad/provincia/CP)" },
                { status: 400 }
            )
        }

        const carrier = ((pedido.carrier || "CORREO_ARGENTINO") as Carrier)
        const provider = getProvider(carrier)

        // Armar input común (lo vas a adaptar según API real)
        const input = {
            pedidoId: pedido.id,
            numero: pedido.numero,
            nombre: `${pedido.nombreCliente ?? ""} ${pedido.apellidoCliente ?? ""}`.trim(),
            telefono: pedido.telefonoCliente,
            email: pedido.emailCliente,
            direccion: pedido.direccion,
            ciudad: pedido.ciudad,
            provincia: pedido.provincia,
            codigoPostal: pedido.codigoPostal,
            sucursalId: pedido.sucursalId,
            sucursalNombre: pedido.sucursalNombre ?? pedido.sucursalCorreo,
            total: pedido.total,
        }

        const label = await provider.createLabel(input)

        const updated = await prisma.pedido.update({
            where: { id },
            data: {
                trackingNumber: label.trackingCode,
                trackingUrl: label.trackingUrl ?? null,
                labelUrl: label.labelUrl,
                estado: "enviado",
                shippedAt: new Date(),
            },
        })

        return NextResponse.json({ ok: true, pedido: updated })
    } catch (e) {
        console.error("❌ generar-rotulo:", e)
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
    }
}
