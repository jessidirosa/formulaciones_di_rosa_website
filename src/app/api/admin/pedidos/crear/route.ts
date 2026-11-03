import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { emailPedidoRecibido, emailPedidoConfirmado } from "@/lib/emailTemplates"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!session || user?.role !== "ADMIN") {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 })
        }

        const body = await req.json()
        const {
            nombreCliente,
            apellidoCliente,
            emailCliente,
            telefonoCliente,
            dniCliente,
            direccion,
            localidad,
            provincia,
            codigoPostal,
            tipoEntrega,
            metodoPago,
            estado,
            items, // Array de { productoId, nombreProducto, cantidad, precioUnitario, notas }
            costoEnvio = 0,
            descuento = 0,
            fechaEstimadaEnvio,
            notasCliente
        } = body

        if (!nombreCliente || !emailCliente || !items || items.length === 0) {
            return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 })
        }

        // Calcular subtotales
        const subtotal = items.reduce((acc: number, it: any) => acc + (it.precioUnitario * it.cantidad), 0)
        const total = subtotal + Number(costoEnvio) - Number(descuento)

        // Generar número de pedido único (ej: P-1024)
        const ultimoPedido = await prisma.pedido.findFirst({
            orderBy: { id: "desc" },
            select: { id: true }
        })
        const siguienteId = (ultimoPedido?.id || 0) + 1
        const numero = `P-${String(siguienteId).padStart(4, "0")}`
        const publicToken = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

        // Crear pedido en la BD
        const nuevoPedido = await prisma.pedido.create({
            data: {
                numero,
                publicToken,
                nombreCliente,
                apellidoCliente,
                emailCliente,
                telefonoCliente,
                dniCliente,
                direccion,
                localidad,
                provincia,
                codigoPostal,
                tipoEntrega: tipoEntrega || "RETIRO_LOCAL",
                metodoEnvio: tipoEntrega || "RETIRO_LOCAL",
                metodoPago: metodoPago || "TRANSFERENCIA",
                estado: estado || "confirmado",
                subtotal: Math.round(subtotal),
                costoEnvio: Math.round(Number(costoEnvio)),
                descuento: Math.round(Number(descuento)),
                fechaEstimadaEnvio: fechaEstimadaEnvio ? new Date(fechaEstimadaEnvio) : null, // ✅ GUARDAR EN BD
                total: Math.round(total),
                notasCliente,
                items: {
                    create: items.map((it: any) => ({
                        productoId: it.productoId ? Number(it.productoId) : null,
                        nombreProducto: it.nombreProducto,
                        cantidad: Number(it.cantidad),
                        subtotal: Math.round(it.precioUnitario * it.cantidad),
                        notas: it.notas || null
                    }))
                }
            }
        })

        if (nuevoPedido.emailCliente) {
            try {
                const appUrl = process.env.APP_URL || "http://localhost:3000"
                const linkEstado = `${appUrl}/pedido/${nuevoPedido.publicToken}`

                if (nuevoPedido.estado === "confirmado" || nuevoPedido.estado === "en_produccion") {
                    // Usamos la plantilla oficial de pago acreditado / confirmado
                    await sendEmail(
                        nuevoPedido.emailCliente,
                        `✅ Pago Acreditado - Pedido #${nuevoPedido.numero}`,
                        emailPedidoConfirmado({
                            nombre: nuevoPedido.nombreCliente || undefined,
                            pedidoNumero: nuevoPedido.numero,
                            linkEstado
                        })
                    )
                } else {
                    // Usamos la plantilla completa con el desglose de productos y totales
                    const itemsFormatted = items.map((it: any) => ({
                        nombre: it.nombreProducto,
                        cantidad: Number(it.cantidad),
                        subtotal: Math.round(it.precioUnitario * it.cantidad)
                    }))

                    await sendEmail(
                        nuevoPedido.emailCliente,
                        `🧾 Recibimos tu pedido #${nuevoPedido.numero}`,
                        emailPedidoRecibido({
                            nombre: nuevoPedido.nombreCliente || undefined,
                            pedidoNumero: nuevoPedido.numero,
                            total: nuevoPedido.total,
                            subtotal: nuevoPedido.subtotal,
                            costoEnvio: nuevoPedido.costoEnvio,
                            descuento: nuevoPedido.descuento,
                            metodoPago: nuevoPedido.metodoPago || undefined,
                            linkEstado,
                            items: itemsFormatted
                        })
                    )
                }
            } catch (err) {
                console.error("Error al enviar el email de orden manual:", err)
            }
        }

        return NextResponse.json({ ok: true, pedido: nuevoPedido })
    } catch (error: any) {
        console.error("❌ Error al crear pedido manual:", error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}