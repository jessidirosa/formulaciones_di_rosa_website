import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

function formatARS(n: number) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(n)
}

function formatDate(d?: Date | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("es-AR")
}

function prettyEstado(estado?: string | null) {
    const e = (estado || "").toLowerCase()

    const map: Record<string, string> = {
        pendiente: "Pendiente",
        pagado: "Pagado",
        cancelado: "Cancelado",
        enviado: "Enviado",
        entregado: "Entregado",
        listo_envio: "Listo para enviar",
        en_produccion: "En producción",

        // 👇 estados nuevos del flujo transferencia
        pending_payment_transfer: "Pendiente de pago (transferencia)",
        cancelled_expired: "Cancelado (no se recibió el pago a tiempo)",
        confirmado: "Confirmado",
        transfer_proof_sent: "Comprobante enviado (en revisión)",

    }

    return map[e] || estado || "Sin estado"
}

function badgeEstado(estado?: string | null) {
    const e = (estado || "").toLowerCase()
    if (e.includes("cancel")) return "bg-red-100 text-red-800 border-red-200"
    if (e.includes("pend") || e.includes("pending")) return "bg-amber-100 text-amber-900 border-amber-200"
    if (e.includes("pag") || e.includes("confirm")) return "bg-green-100 text-green-900 border-green-200"
    if (e.includes("envi")) return "bg-blue-100 text-blue-900 border-blue-200"
    if (e.includes("entre")) return "bg-emerald-100 text-emerald-900 border-emerald-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
}

export default async function PedidoPublicPage({
    params,
}: {
    params: { token: string }
}) {
    const { token } = params

    const pedido = await prisma.pedido.findUnique({
        where: { publicToken: token },
        include: { items: true },
    })

    if (!pedido) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-2xl">
                <h1 className="text-2xl font-bold mb-2">Pedido no encontrado</h1>
                <p className="text-gray-600">
                    Revisá que el link sea correcto. Si necesitás ayuda, escribinos por WhatsApp.
                </p>
            </div>
        )
    }

    const estadoNice = prettyEstado(pedido.estado)
    const estadoCls = badgeEstado(pedido.estado)

    return (
        <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">Estado de tu pedido</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-gray-700">
                        Pedido <b>{pedido.numero}</b>
                    </p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${estadoCls}`}>
                        {estadoNice}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Creado: {formatDate(pedido.createdAt)} • Estimado de envío: {formatDate(pedido.fechaEstimadaEnvio)}
                </p>
            </div>

            {/* Totales */}
            <div className="border rounded-lg p-4 bg-white space-y-2">
                <h2 className="font-semibold text-lg">Resumen</h2>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatARS(pedido.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-medium">{formatARS(pedido.costoEnvio)}</span>
                </div>

                {pedido.descuento > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Descuento</span>
                        <span className="font-medium text-green-700">- {formatARS(pedido.descuento)}</span>
                    </div>
                )}

                <div className="flex justify-between text-base pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-rose-600">{formatARS(pedido.total)}</span>
                </div>

                {/* método pago/envío */}
                <div className="pt-3 text-sm text-gray-700">
                    <p><span className="font-medium">Método de pago:</span> {pedido.metodoPago || "—"}</p>
                    <p><span className="font-medium">Envío:</span> {pedido.metodoEnvio || "—"}</p>

                    {pedido.sucursalCorreo && (
                        <p><span className="font-medium">Sucursal:</span> {pedido.sucursalCorreo}</p>
                    )}
                </div>

                {pedido.estado?.toLowerCase() === "listo_envio" && (
                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900 text-sm">
                        <p className="font-medium">📦 Listo para enviar</p>
                        <p>En los próximos días ya lo despachamos. Apenas salga, te aparece el seguimiento acá.</p>
                    </div>
                )}

                {pedido.estado?.toLowerCase() === "enviado" && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 text-sm space-y-2">
                        <p className="font-medium">🚚 Enviado</p>
                        {pedido.trackingNumber && (
                            <p>Número de seguimiento: <b>{pedido.trackingNumber}</b></p>
                        )}
                        {pedido.trackingUrl && (
                            <a
                                href={pedido.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex text-emerald-800 underline"
                            >
                                Ver seguimiento
                            </a>
                        )}
                    </div>
                )}



                {/* transferencia: aviso vencimiento */}
                {pedido.estado?.toLowerCase() === "pending_payment_transfer" && pedido.expiresAt && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
                        <p className="font-medium">⏳ Pendiente de pago</p>
                        <p>
                            Tenés tiempo hasta <b>{new Date(pedido.expiresAt).toLocaleString("es-AR")}</b> para enviar la transferencia.
                        </p>
                    </div>
                )}

                {pedido.estado?.toLowerCase() === "transfer_proof_sent" && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 text-sm">
                        <p className="font-medium">✅ Comprobante enviado</p>
                        <p>Estamos revisándolo. En cuanto confirmemos, el estado va a cambiar automáticamente.</p>
                    </div>
                )}

                {pedido.estado?.toLowerCase() === "enviado" && (
                    <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-indigo-900 text-sm space-y-2">
                        <p className="font-medium">🚚 Enviado</p>

                        {pedido.trackingNumber ? (
                            <p>Seguimiento: <b>{pedido.trackingNumber}</b></p>
                        ) : (
                            <p>Estamos procesando tu número de seguimiento.</p>
                        )}

                        {pedido.trackingUrl && (
                            <a className="inline-block text-rose-600 hover:underline" href={pedido.trackingUrl} target="_blank" rel="noreferrer">
                                Ver seguimiento online
                            </a>
                        )}

                        {pedido.labelUrl && (
                            <a className="inline-block text-rose-600 hover:underline" href={pedido.labelUrl} target="_blank" rel="noreferrer">
                                Descargar rótulo (PDF)
                            </a>
                        )}
                    </div>
                )}


            </div>

            {/* Items */}
            <div className="border rounded-lg p-4 bg-white space-y-3">
                <h2 className="font-semibold text-lg">Productos</h2>
                {pedido.items.length === 0 ? (
                    <p className="text-sm text-gray-500">Sin items registrados.</p>
                ) : (
                    <div className="space-y-2">
                        {pedido.items.map((it) => (
                            <div key={it.id} className="flex justify-between text-sm">
                                <span className="text-gray-800">
                                    {it.nombreProducto} <span className="text-gray-500">x {it.cantidad}</span>
                                </span>
                                <span className="font-medium">{formatARS(it.subtotal)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-sm text-gray-600">
                Si necesitás ayuda, escribinos por WhatsApp desde la web.
            </div>
        </div>
    )
}
