import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { crearPreferencia } from "@/lib/mercadopago"

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
      if (user) {
        userId = user.id
      }
    }

    // 1) Calcular fecha estimada
    const capacidadSemanal = Number(process.env.CAPACIDAD_SEMANAL) || 17
    const pedidosPendientes = await prisma.pedido.count({
      where: { estado: "pendiente" },
    })

    const semanasNecesarias = Math.floor(pedidosPendientes / capacidadSemanal)
    const fechaEstimada = new Date()
    fechaEstimada.setDate(fechaEstimada.getDate() + semanasNecesarias * 7 + 3)

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

    // 2) Crear pedido en base
    const pedido = await prisma.pedido.create({
      data: {
        numero: `P-${Date.now()}`,
        userId, // 👈 ahora se asocia si encontramos usuario

        nombreCliente: data.nombreCliente,
        apellidoCliente: data.apellidoCliente,
        emailCliente: data.emailCliente,
        telefonoCliente: data.telefonoCliente,
        dniCliente: data.dniCliente ?? null,

        direccion: data.direccion ?? null,
        ciudad: data.ciudad ?? null,
        provincia: data.provincia ?? null,
        codigoPostal: data.codigoPostal ?? null,
        sucursalCorreo: data.sucursalCorreo ?? null,
        notasCliente: data.notasCliente ?? null,
        fechaEstimadaEnvio: fechaEstimada,

        subtotal: data.subtotal,
        costoEnvio: data.costoEnvio,
        descuento: data.descuento,
        total: data.total,

        estado: "pendiente",
        metodoEnvio,

        items: {
          create: (data.items || []).map((item: any) => ({
            productoId: item.productoId,
            nombreProducto: item.nombreProducto,
            cantidad: item.cantidad,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    })

    console.log("🧾 Pedido creado correctamente:", pedido.id)

    // 3) Preferencia Mercado Pago
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
        identification: data.dniCliente
          ? { type: "DNI", number: data.dniCliente }
          : undefined,
      },
      external_reference: pedido.numero,
      payment_methods: {
        installments: 12,
      },
      metadata: {
        pedidoId: pedido.id,
        emailCliente: data.emailCliente,
      },
    })

    console.log("💳 Preferencia MP creada:", preferencia.id)

    return NextResponse.json({
      ok: true,
      pedidoId: pedido.id,
      preferenceId: preferencia.id,
      initPoint:
        preferencia.init_point ||
        preferencia.sandbox_init_point ||
        null,
    })
  } catch (error) {
    console.error("❌ Error en create-order:", error)
    return NextResponse.json(
      {
        ok: false,
        error:
          "Hubo un problema al procesar tu pedido. Por favor, intentá nuevamente.",
      },
      { status: 500 }
    )
  }
}
