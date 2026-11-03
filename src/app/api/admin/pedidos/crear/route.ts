import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

        return NextResponse.json({ ok: true, pedido: nuevoPedido })
    } catch (error: any) {
        console.error("❌ Error al crear pedido manual:", error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}