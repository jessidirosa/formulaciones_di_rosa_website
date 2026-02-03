import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { crearPreferencia } from "@/lib/mercadopago"
import { sendEmail, ADMIN_EMAIL } from "@/lib/email"
import { emailPedidoRecibido, emailNuevoPedidoAdmin } from "@/lib/emailTemplates"
import { calcularFechaEstimada } from "@/lib/capacity"
import crypto from "crypto"

// Función para generar un código aleatorio corto
function generarCodigoPedido(length = 6) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    let userId: number | null = null
    if (data.emailCliente) {
      const user = await prisma.user.findUnique({
        where: { email: data.emailCliente },
      })
      if (user) userId = user.id
    }

    const fechaEstimada = await calcularFechaEstimada()
    const rawTipoEntrega = (data.tipoEntrega || "").toUpperCase()

    let metodoEnvio: string
    let tipoEntregaFinal = rawTipoEntrega

    switch (rawTipoEntrega) {
      case "ENVIO_DOMICILIO": metodoEnvio = "Envío a domicilio"; break
      case "SUCURSAL_CORREO":
      case "SUCURSAL":
        metodoEnvio = "Retiro en sucursal"
        tipoEntregaFinal = "SUCURSAL_CORREO"
        break
      case "RETIRO_LOCAL": metodoEnvio = "Retiro en local"; break
      case "MOTOMENSAJERIA": metodoEnvio = "Motomensajería"; break
      default: metodoEnvio = "Desconocido"
    }

    const metodoPago = (data.metodoPago || "MERCADOPAGO").toUpperCase()
    const isTransfer = metodoPago === "TRANSFERENCIA"
    const estadoPedido = isTransfer ? "pending_payment_transfer" : "pendiente_mercadopago"
    const expiresAt = isTransfer ? new Date(Date.now() + 60 * 60 * 1000) : null

    const finalCarrier = (rawTipoEntrega === 'ENVIO_DOMICILIO' || rawTipoEntrega === 'SUCURSAL_CORREO')
      ? (data.carrier || "CORREO_ARGENTINO")
      : null;

    const rawItems = Array.isArray(data.items) ? data.items : []
    const itemsCreate = rawItems.map((item: any) => ({
      productoId: Number(item.productoId) || null,
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
    }))

    // ✅ LÓGICA DE UNICIDAD: Generamos y verificamos que el código no exista
    let codigoFinal = "";
    let existe = true;
    while (existe) {
      codigoFinal = `P-${generarCodigoPedido()}`;
      const pedidoExistente = await prisma.pedido.findFirst({
        where: { numero: codigoFinal }
      });
      if (!pedidoExistente) existe = false;
    }

    const pedido = await prisma.pedido.create({
      data: {
        numero: codigoFinal, // ✅ Ahora garantizado que es único
        userId,
        nombreCliente: data.nombreCliente,
        apellidoCliente: data.apellidoCliente,
        emailCliente: data.emailCliente,
        telefonoCliente: data.telefonoCliente,
        dniCliente: data.dniCliente ?? null,
        direccion: data.direccion ?? null,
        ciudad: data.localidad || data.ciudad || null,
        localidad: data.localidad || null,
        provincia: data.provincia || null,
        codigoPostal: data.codigoPostal || null,
        notasCliente: data.notasCliente ?? null,
        fechaEstimadaEnvio: fechaEstimada,
        subtotal: data.subtotal,
        costoEnvio: data.costoEnvio,
        descuento: data.descuento ?? 0,
        total: data.total,
        estado: estadoPedido,
        metodoEnvio,
        tipoEntrega: tipoEntregaFinal,
        carrier: finalCarrier,
        sucursalId: data.sucursalId ? String(data.sucursalId) : null,
        sucursalNombre: data.sucursalNombre || null,
        sucursalCorreo: data.sucursalCorreo || null,
        adminSeenAt: null,
        publicToken: crypto.randomUUID(),
        metodoPago,
        expiresAt,
        cuponCodigo: data.cuponCodigo || null,    // ✅ Guardamos el código
        cuponDescuento: data.cuponDescuento || 0, // ✅ Guardamos el monto
        items: { create: itemsCreate },
      },
      include: { items: true },
    })

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { telefono: data.telefonoCliente }
      })
    }

    // --- NOTIFICACIONES ---
    try {
      const appUrl = process.env.APP_URL || "http://localhost:3000"
      const linkEstado = `${appUrl}/pedido/${pedido.publicToken}`

      if (isTransfer) {
        if (pedido.emailCliente) {
          await sendEmail(
            pedido.emailCliente,
            "Recibimos tu pedido - Di Rosa Formulaciones",
            emailPedidoRecibido({
              nombre: pedido.nombreCliente || undefined,
              pedidoNumero: pedido.numero,
              subtotal: pedido.subtotal,
              costoEnvio: pedido.costoEnvio,
              descuento: pedido.descuento,
              metodoPago: "Transferencia Bancaria",
              total: pedido.total,
              linkEstado,
              items: (pedido.items || []).map(it => ({ nombre: it.nombreProducto, cantidad: it.cantidad, subtotal: it.subtotal }))
            })
          )
        }

        await sendEmail(
          ADMIN_EMAIL,
          `📦 Nueva venta por Transferencia #${pedido.numero}`,
          emailNuevoPedidoAdmin({
            pedidoNumero: pedido.numero,
            cliente: `${pedido.nombreCliente} ${pedido.apellidoCliente}`,
            total: pedido.total,
            linkAdmin: `${appUrl}/admin/pedidos`
          })
        )
      }
    } catch (e) {
      console.error("⚠️ Error en notificaciones:", e)
    }

    if (isTransfer) {
      return NextResponse.json({ ok: true, pedidoId: pedido.id })
    }

    // --- MERCADO PAGO ---
    const mpItems = (data.items || []).map((item: any) => ({
      title: item.nombreProducto,
      quantity: Number(item.cantidad),
      unit_price: Number(item.precioUnitario),
      currency_id: "ARS",
    }))

    const preferencia = await crearPreferencia({
      items: mpItems,
      payer: {
        name: data.nombreCliente,
        surname: data.apellidoCliente,
        email: data.emailCliente,
      },
      external_reference: pedido.numero,
      metadata: {
        pedidoId: pedido.id,
        emailCliente: data.emailCliente
      }
    })

    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { mercadopagoUrl: preferencia.init_point }
    })

    return NextResponse.json({
      ok: true,
      pedidoId: pedido.id,
      initPoint: preferencia.init_point,
    })

  } catch (error: any) {
    console.error("❌ Error en create-order:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}