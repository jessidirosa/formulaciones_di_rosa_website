// src/lib/shipping/providers/correoArgentino.ts
import "server-only"
import type { Pedido } from "@prisma/client"

export type CorreoArgentinoConfig = {
    baseUrl: string // ej: https://api.correoargentino.com.ar/paqar (depende tu contrato)
    apiKey: string
    agreement: string
    sellerId: string // lo pide /v1/labels
}

function getHeaders(cfg: CorreoArgentinoConfig) {
    return {
        Authorization: `Apikey ${cfg.apiKey}`,
        agreement: cfg.agreement,
        "Content-Type": "application/json",
    }
}

export async function correoArgentinoCrearEnvio(
    pedido: Pedido,
    cfg: CorreoArgentinoConfig
): Promise<{ trackingNumber: string }> {
    const url = `${cfg.baseUrl}/v1/orders`

    // ⚠️ El body exacto depende del contrato. Esto sigue el ejemplo del PDF.
    const body: any = {
        order: {
            // referencia tuya
            orderNumber: pedido.numero,
            // servicio según entrega
            serviceType:
                (pedido.tipoEntrega || "").toUpperCase() === "SUCURSAL_CORREO"
                    ? "SUCURSAL"
                    : "DOMICILIO",
            recipient: {
                firstName: pedido.nombreCliente || "",
                lastName: pedido.apellidoCliente || "",
                email: pedido.emailCliente || "",
                phone: pedido.telefonoCliente || "",
                identification: pedido.dniCliente || "",
                address: {
                    street: pedido.direccion || "",
                    city: pedido.ciudad || "",
                    province: pedido.provincia || "",
                    zipCode: pedido.codigoPostal || "",
                },
            },
            // si es sucursal y tu contrato lo usa
            agencyId: pedido.sucursalId || undefined,
        },
    }

    const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(cfg),
        body: JSON.stringify(body),
        cache: "no-store",
    })

    const text = await res.text()
    if (!res.ok) {
        throw new Error(`Correo Argentino /v1/orders error (${res.status}): ${text}`)
    }

    const json = JSON.parse(text)
    const trackingNumber =
        json?.trackingNumber || json?.order?.trackingNumber || json?.data?.trackingNumber

    if (!trackingNumber) {
        throw new Error("Correo Argentino: no vino trackingNumber en la respuesta.")
    }

    return { trackingNumber: String(trackingNumber) }
}

export async function correoArgentinoObtenerRotuloPDF(
    trackingNumber: string,
    cfg: CorreoArgentinoConfig
): Promise<Buffer> {
    const url = `${cfg.baseUrl}/v1/labels`

    // Según el PDF: array de labels, devuelve fileBase64
    const body = {
        labels: [
            {
                sellerId: cfg.sellerId,
                trackingNumber,
            },
        ],
    }

    const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(cfg),
        body: JSON.stringify(body),
        cache: "no-store",
    })

    const text = await res.text()
    if (!res.ok) {
        throw new Error(`Correo Argentino /v1/labels error (${res.status}): ${text}`)
    }

    const json = JSON.parse(text)
    const fileBase64 =
        json?.labels?.[0]?.fileBase64 || json?.[0]?.fileBase64 || json?.fileBase64

    if (!fileBase64) {
        throw new Error("Correo Argentino: no vino fileBase64 para el rótulo.")
    }

    return Buffer.from(fileBase64, "base64")
}
