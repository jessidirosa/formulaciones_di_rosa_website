type EmailItem = {
  nombre: string
  cantidad: number
  subtotal: number
}

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n)
}

function row(label: string, value: string) {
  return `
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">${label}</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;color:#111827;">${value}</td>
      </tr>
    `
}

function itemsTable(items: EmailItem[]) {
  return `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:10px;">
        <thead>
          <tr>
            <th align="left" style="padding:8px 0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Producto</th>
            <th align="right" style="padding:8px 0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(it => `
            <tr>
              <td style="padding:10px 0;border-top:1px solid #e5e7eb;font-size:14px;">${it.nombre} x ${it.cantidad}</td>
              <td style="padding:10px 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:600;font-size:14px;">${formatARS(it.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
}

function baseLayout(title: string, bodyHtml: string) {
  return `
    <div style="background:#F5F5F0;padding:24px;font-family:sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #E9E9E0;">
        <div style="padding:30px;background:#E9E9E0;text-align:center;">
          <div style="font-weight:800;font-size:18px;color:#3A4031;letter-spacing:0.2em;">DI ROSA FORMULACIONES</div>
          <div style="font-size:10px; color:#4A5D45; margin-top:5px; letter-spacing:0.1em;">COSMÉTICA MAGISTRAL</div>
        </div>
        <div style="padding:40px 30px;line-height:1.6;color:#374151;">
          <h1 style="margin:0 0 20px;font-size:22px;color:#111827;text-align:center;">${title}</h1>
          ${bodyHtml}
          <div style="margin-top:30px; padding-top:20px; border-top:1px solid #E9E9E0; text-align:center;">
            <p style="font-size:12px; color:#6b7280;">Podés seguir el avance de tu pedido en tiempo real desde nuestra web ingresando a tu cuenta o con el link de seguimiento proporcionado.</p>
          </div>
        </div>
      </div>
    </div>`
}

export function emailPedidoRecibido(params: {
  nombre?: string,
  pedidoNumero: string,
  total: number,
  subtotal: number,
  costoEnvio: number,
  descuento?: number,
  metodoPago?: string,
  linkEstado: string,
  items: EmailItem[]
}) {
  const isTransfer = params.metodoPago?.toUpperCase().includes("TRANSFERENCIA");

  const body = `
      <p>Hola${params.nombre ? ` <b>${params.nombre}</b>` : ""} 👋</p>
      <p>Recibimos tu pedido <b>#${params.pedidoNumero}</b> correctamente.</p>
      
      ${isTransfer ? `
      <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:16px; padding:20px; margin:20px 0;">
        <p style="margin:0; font-weight:700; color:#92400E; font-size:14px;">⚠️ IMPORTANTE: Pendiente de pago</p>
        <p style="font-size:13px; color:#92400E;">Tenés <b>1 hora</b> para realizar la transferencia y enviarnos el comprobante antes de que el pedido expire.</p>
        <p style="font-size:13px; margin-bottom:5px;"><b>Datos para la transferencia:</b></p>
        <p style="font-size:13px; margin:2px 0;">ENTIDAD: MERCADO PAGO</p>
        <p style="font-size:13px; margin:2px 0;">ALIAS: DIROSA.MP</p>
        <p style="font-size:13px; margin:2px 0;">TITULAR: JESSICA MELANIE DI ROSA</p>
        <p style="font-size:12px; margin:2px 0;">Si ya abonaste, envianos el comprobante por WhatsApp y aguardá a que validemos el pago para confirmar el pedido. Te llegará la confirmación vía email.</p>
      </div>
      ` : ''}

      <div style="border:1px solid #E9E9E0;border-radius:16px;padding:20px;margin:20px 0;">
        <p style="font-weight:700;margin-top:0;">Resumen del pedido</p>
        ${itemsTable(params.items)}
        <table width="100%" style="margin-top:10px;">
          ${row("Subtotal", formatARS(params.subtotal))}
          ${row("Envío", formatARS(params.costoEnvio))}
          ${params.descuento ? row("Descuento", `- ${formatARS(params.descuento)}`) : ""}
          ${params.metodoPago ? row("Método de Pago", params.metodoPago) : ""}
          <tr>
            <td style="padding:10px 0;font-weight:800;border-top:1px solid #F5F5F0;">Total</td>
            <td style="padding:10px 0;text-align:right;font-size:18px;font-weight:900;color:#4A5D45;border-top:1px solid #F5F5F0;">${formatARS(params.total)}</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;margin-top:20px;">
        <a href="${params.linkEstado}" style="background:#4A5D45;color:white;padding:12px 25px;text-decoration:none;border-radius:12px;font-weight:bold;display:inline-block;">VER ESTADO EN LA WEB</a>
      </div>
    `
  return baseLayout("🧾 Recibimos tu pedido", body)
}

export function emailPedidoConfirmado(params: { nombre?: string, pedidoNumero: string, linkEstado: string }) {
  const body = `
    <p>Hola ${params.nombre || ""} ✅</p>
    <p>¡Excelentes noticias! Tu pago ha sido acreditado correctamente.</p>
    <p>El pedido <b>#${params.pedidoNumero}</b> ya se encuentra confirmado y en la fila de ingreso al laboratorio para su formulación.</p>
    <div style="text-align:center;margin-top:20px;">
        <a href="${params.linkEstado}" style="background:#4A5D45;color:white;padding:12px 25px;text-decoration:none;border-radius:12px;font-weight:bold;display:inline-block;">SEGUIR MI PEDIDO</a>
    </div>
  `;
  return baseLayout("✅ Pago Acreditado", body);
}

export function emailEnProduccion(params: { nombre?: string, pedidoNumero: string, linkEstado: string }) {
  const body = `<p>Tu pedido <b>#${params.pedidoNumero}</b> ya está siendo formulado por nuestros especialistas. Te avisaremos cuando pase al área de empaque.</p>`;
  return baseLayout("🧪 En Laboratorio", body);
}

export function emailPedidoListo(params: { nombre?: string, pedidoNumero: string, linkEstado: string }) {
  const body = `<p>¡Tu pedido <b>#${params.pedidoNumero}</b> ha finalizado su etapa de elaboración! Ya está listo y esperando ser retirado por el transporte.</p>`;
  return baseLayout("✨ Pedido Preparado", body);
}

export function emailPedidoEnviado(params: {
  nombre?: string,
  pedidoNumero: string,
  trackingNumber: string,
  trackingUrl: string,
  carrier: string
}) {
  const carrierName = params.carrier === 'ANDREANI' ? 'Andreani' : 'Correo Argentino';
  const body = `
    <p>Hola${params.nombre ? ` <b>${params.nombre}</b>` : ""} 🚚</p>
    <p>Tu pedido <b>#${params.pedidoNumero}</b> ya fue despachado a través de <b>${carrierName}</b>.</p>
    
    <div style="background:#F9F9F7; border:1px solid #E9E9E0; border-radius:16px; padding:25px; margin:20px 0; text-align:center;">
      <p style="margin:0; font-size:11px; color:#A3B18A; text-transform:uppercase; font-weight:700; letter-spacing:1px;">Número de Seguimiento</p>
      <p style="font-size:26px; font-weight:800; margin:10px 0; color:#3A4031;">${params.trackingNumber}</p>
      <div style="margin-top:15px;">
        <a href="${params.trackingUrl}" style="background:#4A5D45; color:white; padding:14px 28px; border-radius:12px; text-decoration:none; display:inline-block; font-weight:bold; font-size:13px;">RASTREAR PAQUETE</a>
      </div>
    </div>
    
    <p style="font-size:13px; color:#6b7280; text-align:center;">Tené en cuenta que el correo puede tardar hasta 24hs en actualizar el estado en su sistema de seguimiento.</p>
  `;
  return baseLayout("🚚 Pedido en Camino", body);
}

export function emailPedidoCancelado(params: { nombre?: string, pedidoNumero: string }) {
  const body = `
    <p>Hola ${params.nombre || ""} ❌</p>
    <p>Te informamos que tu pedido <b>#${params.pedidoNumero}</b> ha sido cancelado.</p>
    <p>Si creés que se trata de un error o tenés alguna duda sobre el motivo de la cancelación, por favor comunicate con nosotros indicando tu número de orden.</p>
    <div style="text-align:center;margin-top:25px;">
      <a href="https://wa.me/541137024467" style="background:#25D366;color:white;padding:12px 25px;text-decoration:none;border-radius:12px;font-weight:bold;display:inline-block;">CONSULTAR POR WHATSAPP</a>
    </div>
  `;
  return baseLayout("❌ Pedido Cancelado", body);
}

export function emailPagoExpirado(params: { nombre?: string, pedidoNumero: string }) {
  const body = `
    <p>Hola ${params.nombre || ""} ⏳</p>
    <p>El tiempo límite de 1 hora para realizar la transferencia de tu pedido <b>#${params.pedidoNumero}</b> ha expirado.</p>
    <p>Por este motivo, el sistema ha cancelado la orden automáticamente para liberar el stock de los productos reservados.</p>
    <p><b>¿Aún querés tus productos?</b> No te preocupes, podés realizar una nueva compra en nuestra web o consultarnos si ya habías realizado el pago y no llegaste a avisar.</p>
    <div style="text-align:center;margin-top:25px;">
      <a href="https://wa.me/541137024467" style="background:#25D366;color:white;padding:12px 25px;text-decoration:none;border-radius:12px;font-weight:bold;display:inline-block;">AVISAR PAGO / CONSULTAR</a>
    </div>
  `;
  return baseLayout("⏳ Pago Expirado", body);
}

export function emailNuevoPedidoAdmin(params: { pedidoNumero: string, cliente: string, total: number, linkAdmin: string }) {
  return baseLayout("📦 Nuevo Pedido en la Web", `
        <p>Se ha registrado una nueva orden de venta:</p>
        <p><b>Orden:</b> #${params.pedidoNumero}</p>
        <p><b>Cliente:</b> ${params.cliente}</p>
        <p><b>Total:</b> ${formatARS(params.total)}</p>
        <div style="margin-top:20px; text-align:center;">
            <a href="${params.linkAdmin}" style="background:#4A5D45;color:white;padding:12px 20px;text-decoration:none;border-radius:10px;font-weight:bold;display:inline-block;">GESTIONAR EN PANEL</a>
        </div>
    `);
}

export function emailNuevaConsultaAdmin(params: {
  nombre: string,
  email: string,
  telefono: string,
  tipo: string,
  mensaje: string
}) {
  const body = `
    <div style="background:#F9F9F7; border:1px solid #E9E9E0; border-radius:16px; padding:25px; margin:20px 0;">
      <p style="margin:0 0 10px; font-size:12px; color:#A3B18A; text-transform:uppercase; font-weight:700;">Datos del Interesado</p>
      <p style="margin:5px 0; font-size:14px;"><b>Nombre:</b> ${params.nombre}</p>
      <p style="margin:5px 0; font-size:14px;"><b>Email:</b> ${params.email}</p>
      <p style="margin:5px 0; font-size:14px;"><b>Teléfono:</b> <a href="tel:${params.telefono}" style="color:#4A5D45; text-decoration:none; font-weight:bold;">${params.telefono}</a></p>
      <p style="margin:5px 0; font-size:14px;"><b>Asunto:</b> ${params.tipo}</p>
      <hr style="border:0; border-top:1px solid #E9E9E0; margin:20px 0;" />
      <p style="margin:0 0 10px; font-size:12px; color:#A3B18A; text-transform:uppercase; font-weight:700;">Mensaje</p>
      <p style="margin:0; font-size:15px; line-height:1.6; color:#3A4031;">${params.mensaje.replace(/\n/g, '<br>')}</p>
    </div>
    <div style="text-align:center; margin-top:20px;">
      <a href="mailto:${params.email}" style="background:#4A5D45; color:white; padding:12px 25px; text-decoration:none; border-radius:12px; font-weight:bold; display:inline-block;">RESPONDER POR EMAIL</a>
      <a href="https://wa.me/${params.telefono.replace(/[^0-9]/g, '')}" style="background:#25D366; color:white; padding:12px 25px; text-decoration:none; border-radius:12px; font-weight:bold; display:inline-block; margin-left:10px;">WHATSAPP</a>
    </div>
  `;
  return baseLayout("📩 Nueva Consulta Web", body);
}