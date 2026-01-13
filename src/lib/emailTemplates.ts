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
    const rows = items
        .map(
            (it) => `
        <tr>
          <td style="padding:10px 0;border-top:1px solid #e5e7eb;color:#111827;font-size:14px;">
            ${it.nombre} <span style="color:#6b7280;">x ${it.cantidad}</span>
          </td>
          <td style="padding:10px 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;font-size:14px;">
            ${formatARS(it.subtotal)}
          </td>
        </tr>
      `
        )
        .join("")

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:10px;">
        <thead>
          <tr>
            <th align="left" style="padding:8px 0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">
              Producto
            </th>
            <th align="right" style="padding:8px 0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `
}

function button(link: string, text: string) {
    return `
      <div style="margin:18px 0;">
        <a href="${link}"
           style="display:inline-block;background:#c7ca65;color:#111827;text-decoration:none;
                  padding:12px 16px;border-radius:12px;font-weight:700;font-size:14px;">
          ${text}
        </a>
      </div>
      <div style="color:#6b7280;font-size:12px;">
        Si el botón no funciona, copiá y pegá este link en tu navegador:<br/>
        <span style="word-break:break-all;color:#111827;">${link}</span>
      </div>
    `
}

function baseLayout(title: string, bodyHtml: string) {
    return `
    <div style="background:#f8fafc;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="padding:18px 20px;background:#d6d8b8;">
          <div style="font-weight:800;font-size:16px;color:#111827;">Di Rosa Formulaciones</div>
          <div style="font-size:12px;color:#374151;">Cosmética magistral • Skincare • Capilar</div>
        </div>
  
        <div style="padding:22px 20px;font-family:Arial,sans-serif;line-height:1.45;color:#111827;">
          <h1 style="margin:0 0 12px;font-size:20px;">${title}</h1>
          ${bodyHtml}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0;" />
          <p style="margin:0;color:#6b7280;font-size:12px;">
            Si necesitás ayuda, respondé este email o escribinos desde la web.
          </p>
        </div>
      </div>
    </div>
    `
}

export function emailPedidoRecibido(params: {
    nombre?: string
    pedidoNumero: string
    total: number
    subtotal: number
    costoEnvio: number
    descuento?: number
    linkEstado: string
    items: EmailItem[]
}) {
    const { nombre, pedidoNumero, total, subtotal, costoEnvio, descuento = 0, linkEstado, items } =
        params

    const body = `
      <p style="margin:0 0 10px;color:#374151;">
        Hola${nombre ? ` <b>${nombre}</b>` : ""} 👋
        Recibimos tu pedido <b>${pedidoNumero}</b>. Te avisamos por acá cuando lo confirmemos.
      </p>
  
      <div style="border:1px solid #e5e7eb;border-radius:14px;padding:14px 14px;margin:14px 0;">
        <div style="font-weight:700;margin-bottom:8px;">Resumen del pedido</div>
  
        ${itemsTable(items)}
  
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:10px;">
          <tbody>
            ${row("Subtotal", formatARS(subtotal))}
            ${row("Envío", formatARS(costoEnvio))}
            ${descuento > 0 ? row("Descuento", `- ${formatARS(descuento)}`) : ""}
            <tr>
              <td style="padding:10px 0;border-top:1px solid #e5e7eb;font-size:15px;font-weight:800;">
                Total
              </td>
              <td style="padding:10px 0;border-top:1px solid #e5e7eb;text-align:right;font-size:16px;font-weight:900;color:#82801a;">
                ${formatARS(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      ${button(linkEstado, "Ver estado de mi pedido")}
    `

    return baseLayout("🧾 Pedido recibido", body)
}

export function emailPedidoConfirmado(params: {
    nombre?: string
    pedidoNumero: string
    linkEstado: string
    items: EmailItem[]
    total: number
}) {
    const { nombre, pedidoNumero, linkEstado, items, total } = params

    const body = `
      <p style="margin:0 0 10px;color:#374151;">
        Hola${nombre ? ` <b>${nombre}</b>` : ""} ✅
        Confirmamos tu pedido <b>${pedidoNumero}</b>.
      </p>
  
      <div style="border:1px solid #e5e7eb;border-radius:14px;padding:14px 14px;margin:14px 0;">
        <div style="font-weight:700;margin-bottom:8px;">Productos</div>
        ${itemsTable(items)}
        <div style="margin-top:10px;text-align:right;font-size:16px;font-weight:900;color:#82801a;">
          Total: ${formatARS(total)}
        </div>
      </div>
  
      ${button(linkEstado, "Ver estado de mi pedido")}
    `

    return baseLayout("✅ Pedido confirmado", body)
}
