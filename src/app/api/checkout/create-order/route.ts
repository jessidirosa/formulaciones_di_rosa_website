import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { crearPreferencia } from "@/lib/mercadopago"
import { sendEmail } from "@/lib/email"
import { emailPedidoRecibido } from "@/lib/emailTemplates"
import { calcularFechaEstimada } from "@/lib/capacity"


export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log("📦 Recibiendo pedido desde el checkout:", data)

    // Buscar usuario por email para asociar el pedido
    let userId: number | null = null
    if (data.emailCliente) {
      const user = await prisma.user.findUnique({
        where: { email: data.emailCliente },
      })
      if (user) userId = user.id
    }

    // 1) Calcular fecha estimada
    const fechaEstimada = await calcularFechaEstimada()
    console.log("🎯 Fecha estimada de envío calculada:", fechaEstimada)
    const rawTipoEntrega = (data.tipoEntrega || "").toUpperCase()

    let metodoEnvio: string
    switch (rawTipoEntrega) {
      case "ENVIO_DOMICILIO":
        metodoEnvio = "Envío a domicilio"
        break
      case "SUCURSAL_CORREO":
        metodoEnvio = "Retiro en sucursal Correo Argentino"
        break
      case "RETIRO_LOCAL":
        metodoEnvio = "Retiro en local"
        break
      case "MOTOMENSAJERIA":
        metodoEnvio = "Motomensajería"
        break
      default:
        metodoEnvio = "Desconocido"
    }

    // ✅ método de pago
    const metodoPago = (data.metodoPago || "MERCADOPAGO").toUpperCase()
    const isTransfer = metodoPago === "TRANSFERENCIA"

    // ✅ expiración 1 hora si es transferencia
    const expiresAt = isTransfer ? new Date(Date.now() + 60 * 60 * 1000) : null

    // ✅ estado según pago
    const estadoPedido = isTransfer ? "pending_payment_transfer" : "pendiente"

    console.log("🧾 items incoming:", (data.items || []).map((it: any) => ({
      productoId: it.productoId,
      nombre: it.nombreProducto,
    })))
    // ✅ Validar productoId contra DB para evitar FK P2003
    const rawItems = Array.isArray(data.items) ? data.items : []

    const ids = rawItems
      .map((it: any) => Number(it.productoId))
      .filter((n: number) => Number.isFinite(n) && n > 0)

    const existentes = await prisma.producto.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    })

    const existentesSet = new Set(existentes.map(p => p.id))

    const itemsCreate = rawItems.map((item: any) => {
      const pid = Number(item.productoId)
      const productoId =
        Number.isFinite(pid) && pid > 0 && existentesSet.has(pid) ? pid : null

      return {
        productoId, // ✅ solo si existe, sino null
        nombreProducto: item.nombreProducto,
        cantidad: item.cantidad,
        subtotal: item.subtotal,
      }
    })


    // 2) Crear pedido
    const pedido = await prisma.pedido.create({
      data: {
        numero: `P-${Date.now()}`,
        userId,

        nombreCliente: data.nombreCliente,
        apellidoCliente: data.apellidoCliente,
        emailCliente: data.emailCliente,
        telefonoCliente: data.telefonoCliente,
        dniCliente: data.dniCliente ?? null,

        direccion: data.direccion ?? null,
        ciudad: data.ciudad ?? null,
        provincia: data.provincia ?? null,
        codigoPostal: data.codigoPostal ?? null,
        notasCliente: data.notasCliente ?? null,
        fechaEstimadaEnvio: fechaEstimada,

        subtotal: data.subtotal,
        costoEnvio: data.costoEnvio,
        descuento: data.descuento ?? 0,
        total: data.total,

        estado: estadoPedido,
        metodoEnvio,

        carrier: data.carrier ?? "CORREO_ARGENTINO",
        sucursalId: data.sucursalId ?? null,
        sucursalNombre: data.sucursalNombre ?? null,

        // seguís guardando sucursalCorreo para mostrarla fácil
        sucursalCorreo: data.sucursalNombre ?? data.sucursalCorreo ?? null,

        // 👇 “nuevo” para el admin
        adminSeenAt: null,

        // 👇 token público (recordá que en Prisma debe ser String? @unique)
        publicToken: crypto.randomUUID(),

        metodoPago,
        expiresAt,

        items: {
          create: itemsCreate,
        },

      },
      include: { items: true },
    })

    console.log("🧾 Pedido creado correctamente:", pedido.id)

    // ✅ Email “pedido recibido” (no rompe el flujo si falla)
    try {
      const appUrl = process.env.APP_URL || "http://localhost:3000"
      const linkEstado = `${appUrl}/pedido/${pedido.publicToken}`

      const emailItems = pedido.items.map((it) => ({
        nombre: it.nombreProducto,
        cantidad: it.cantidad,
        subtotal: it.subtotal,
      }))

      if (pedido.emailCliente) {
        await sendEmail(
          pedido.emailCliente,
          "Pedido recibido - Di Rosa Formulaciones",
          emailPedidoRecibido({
            nombre: pedido.nombreCliente || undefined,
            pedidoNumero: pedido.numero,
            subtotal: pedido.subtotal,
            costoEnvio: pedido.costoEnvio,
            descuento: pedido.descuento,
            total: pedido.total,
            linkEstado,
            items: emailItems,
          })
        )


        await prisma.pedido.update({
          where: { id: pedido.id },
          data: { customerEmailSentAt: new Date() },
        })
      }
    } catch (e) {
      console.error("⚠️ Falló el email de pedido recibido (no se corta el checkout):", e)
    }

    // ✅ Si es transferencia: NO crear preferencia MP
    if (isTransfer) {
      return NextResponse.json({ ok: true, pedidoId: pedido.id })
    }

    // 3) Preferencia MP
    const mpItems = (data.items || []).map((item: any) => ({
      title: item.nombreProducto,
      quantity: item.cantidad,
      unit_price: item.precioUnitario,
      currency_id: "ARS",
    }))

    const preferencia = await crearPreferencia({
      items: mpItems,
      payer: {
        name: `${data.nombreCliente ?? ""} ${data.apellidoCliente ?? ""}`.trim(),
        email: data.emailCliente,
        identification: data.dniCliente ? { type: "DNI", number: data.dniCliente } : undefined,
      },
      external_reference: pedido.numero,
      payment_methods: { installments: 12 },
      metadata: { pedidoId: pedido.id, emailCliente: data.emailCliente },
    })

    console.log("💳 Preferencia MP creada:", preferencia.id)

    return NextResponse.json({
      ok: true,
      pedidoId: pedido.id,
      preferenceId: preferencia.id,
      initPoint: preferencia.init_point || preferencia.sandbox_init_point || null,
    })
  } catch (error) {
    console.error("❌ Error en create-order:", error)
    return NextResponse.json(
      { ok: false, error: "Hubo un problema al procesar tu pedido. Por favor, intentá nuevamente." },
      { status: 500 }
    )
  }
}
