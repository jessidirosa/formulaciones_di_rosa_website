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
    labelUrl?: string
}> {
    const carrier = (pedido.carrier || "CORREO_ARGENTINO").toUpperCase()
    const localidadFinal = (pedido as any).localidad || pedido.ciudad || ""

    if (carrier === "CORREO_ARGENTINO") {
        const cfg = {
            baseUrl: process.env.CORREOARG_BASE_URL!,
            apiKey: process.env.CORREOARG_API_KEY!,
            agreement: process.env.CORREOARG_AGREEMENT!,
            sellerId: process.env.CORREOARG_SELLER_ID!,
        }

        if (!cfg.baseUrl || !cfg.apiKey || !cfg.agreement || !cfg.sellerId) {
            throw new Error("Faltan variables de entorno de Correo Argentino (BASE_URL/API_KEY/AGREEMENT/SELLER_ID).")
        }

        const { trackingNumber } = await correoArgentinoCrearEnvio(pedido, cfg)
        const pdf = await correoArgentinoObtenerRotuloPDF(trackingNumber, cfg)

        // ✅ URL actualizada según tu especificación para Correo Argentino
        const trackingUrl = `https://www.correoargentino.com.ar/formularios/e-commerce/seguimiento?nro=${trackingNumber}`

        return { trackingNumber, pdf, trackingUrl }
    }

    if (carrier === "ANDREANI") {
        const baseUrl = process.env.ANDREANI_BASE_URL!
        const apiKey = process.env.ANDREANI_API_KEY!
        if (!apiKey) throw new Error("Falta ANDREANI_API_KEY en env.")

        const origen = {
            postal: {
                calle: process.env.EMPRESA_CALLE || "Av. Principal",
                numero: process.env.EMPRESA_NUMERO || "100",
                localidad: process.env.EMPRESA_LOCALIDAD || "CABA",
                region: process.env.EMPRESA_PROVINCIA || "Buenos Aires",
                codigoPostal: process.env.EMPRESA_CP || "1000",
                pais: "AR",
            },
        }

        const destino = {
            postal: {
                calle: pedido.direccion || "Sucursal de Correo",
                numero: "0",
                localidad: localidadFinal,
                region: pedido.provincia || "",
                codigoPostal: pedido.codigoPostal || "",
                pais: "AR",
            },
        }

        const raw = await createAndreaniOrder(
            {
                pedidoNumero: pedido.numero,
                contrato: process.env.ANDREANI_CONTRATO,
                tipoDeServicio: pedido.tipoEntrega === "SUCURSAL_CORREO" ? "S" : "D",
                sucursalClienteID: pedido.sucursalId ? Number(pedido.sucursalId) : null,
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

        // ✅ URL actualizada según tu especificación para Andreani
        const trackingUrl = `https://www.andreani.com/envio/${trackingNumber}`

        if (!pdfBase64) {
            return { trackingNumber, pdf: Buffer.alloc(0), trackingUrl }
        }

        const pdf = Buffer.from(pdfBase64, "base64")
        return { trackingNumber, pdf, trackingUrl }
    }

    throw new Error(`Carrier no soportado: ${carrier}`)
}