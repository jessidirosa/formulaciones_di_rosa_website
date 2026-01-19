// src/lib/shipping/index.ts
import "server-only"
import type { Pedido } from "@prisma/client"
import {
    correoArgentinoCrearEnvio,
    correoArgentinoObtenerRotuloPDF,
} from "./providers/correoArgentino"
import { createAndreaniOrder, extractPdfBase64, extractTracking } from "./providers/andreani"

export async function generarRotuloYTracking(pedido: Pedido): Promise<{
    trackingNumber: string
    pdf: Buffer
    trackingUrl: string
}> {
    const carrier = (pedido.carrier || "CORREO_ARGENTINO").toUpperCase()

    if (carrier === "CORREO_ARGENTINO") {
        const cfg = {
            baseUrl: process.env.CORREOARG_BASE_URL!,
            apiKey: process.env.CORREOARG_API_KEY!,
            agreement: process.env.CORREOARG_AGREEMENT!,
            sellerId: process.env.CORREOARG_SELLER_ID!,
        }

        if (!cfg.baseUrl || !cfg.apiKey || !cfg.agreement || !cfg.sellerId) {
            throw new Error("Faltan env vars de Correo Argentino (BASE_URL/API_KEY/AGREEMENT/SELLER_ID).")
        }

        const { trackingNumber } = await correoArgentinoCrearEnvio(pedido, cfg)
        const pdf = await correoArgentinoObtenerRotuloPDF(trackingNumber, cfg)

        const trackingUrl = `https://www.correoargentino.com.ar/formularios/e-commerce?id=${encodeURIComponent(
            trackingNumber
        )}`

        return { trackingNumber, pdf, trackingUrl }
    }

    if (carrier === "ANDREANI") {
        const baseUrl = process.env.ANDREANI_BASE_URL!
        const apiKey = process.env.ANDREANI_API_KEY!
        if (!apiKey) throw new Error("Falta ANDREANI_API_KEY en env.")

        // ⚠️ Estos datos de origen deberían venir de env/config fija tuya
        const origen = {
            postal: {
                calle: process.env.EMPRESA_CALLE || "Av. Siempre Viva",
                numero: process.env.EMPRESA_NUMERO || "123",
                localidad: process.env.EMPRESA_LOCALIDAD || "CABA",
                region: process.env.EMPRESA_PROVINCIA || "Buenos Aires",
                codigoPostal: process.env.EMPRESA_CP || "1000",
                pais: "AR",
            },
        }

        // Destino: desde pedido
        const destino = {
            postal: {
                calle: pedido.direccion || "",
                numero: "0", // si tu dirección viene tipo "Calle 123", esto hay que parsearlo
                localidad: pedido.ciudad || "",
                region: pedido.provincia || "",
                codigoPostal: pedido.codigoPostal || "",
                pais: "AR",
            },
        }

        const raw = await createAndreaniOrder(
            {
                pedidoNumero: pedido.numero,
                origen,
                destino,
                destinatario: {
                    nombre: pedido.nombreCliente || "",
                    apellido: pedido.apellidoCliente || "",
                    email: pedido.emailCliente || "",
                    telefono: pedido.telefonoCliente || "",
                    dni: pedido.dniCliente || "",
                },
            },
            { baseUrl, apiKey }
        )

        const trackingNumber = extractTracking(raw.rawText) || `ANDREANI-${pedido.numero}`
        const pdfBase64 = extractPdfBase64(raw.rawText)

        if (!pdfBase64) {
            // No rompemos el flujo: te pedirá el endpoint de etiqueta real
            throw new Error(
                "Andreani: orden creada pero NO vino PDF en la respuesta. Falta implementar endpoint real de descarga de etiqueta."
            )
        }

        const pdf = Buffer.from(pdfBase64, "base64")
        const trackingUrl = `https://www.andreani.com/#!/informacionEnvio/${encodeURIComponent(trackingNumber)}`

        return { trackingNumber, pdf, trackingUrl }
    }

    throw new Error(`Carrier no soportado: ${carrier}`)
}
