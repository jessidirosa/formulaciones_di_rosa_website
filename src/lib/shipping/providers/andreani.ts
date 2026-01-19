// src/lib/shipping/providers/andreani.ts
import "server-only"

export type AndreaniEnv = {
    baseUrl: string
    apiKey: string
}

export type AndreaniAddress = {
    calle: string
    numero: string
    piso?: string
    departamento?: string
    localidad: string
    region: string
    codigoPostal: string
    pais?: string
}

export type AndreaniCreateOrderInput = {
    pedidoNumero: string
    origen: { postal: AndreaniAddress }
    destino: { postal: AndreaniAddress }
    destinatario: {
        nombre: string
        apellido?: string
        email?: string
        telefono?: string
        dni?: string
    }
    bultos?: Array<{
        peso?: number
        largo?: number
        alto?: number
        ancho?: number
        valorDeclarado?: number
    }>
    contrato?: string | null
    tipoDeServicio?: string | null
    sucursalClienteID?: number | null
}

function normalizePostal(a: AndreaniAddress) {
    return {
        codigoPostal: a.codigoPostal,
        calle: a.calle,
        numero: a.numero,
        piso: a.piso ?? "",
        departamento: a.departamento ?? "",
        localidad: a.localidad,
        region: a.region,
        pais: a.pais ?? "AR",
    }
}

export async function createAndreaniOrder(
    input: AndreaniCreateOrderInput,
    env?: Partial<AndreaniEnv>
): Promise<{ rawText: string }> {
    const baseUrl =
        env?.baseUrl || process.env.ANDREANI_BASE_URL || "https://apissandbox.andreani.com"

    const apiKey = env?.apiKey || process.env.ANDREANI_API_KEY
    if (!apiKey) throw new Error("Falta ANDREANI_API_KEY en env.")

    const url = `${baseUrl}/beta/transporte-distribucion/ordenes-de-envio`

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/plain",
            Authorization: apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            contrato: input.contrato ?? null,
            tipoDeServicio: input.tipoDeServicio ?? null,
            sucursalClienteID: input.sucursalClienteID ?? null,
            idPedido: input.pedidoNumero,
            origen: { postal: normalizePostal(input.origen.postal) },
            destino: { postal: normalizePostal(input.destino.postal) },
            remitente: { nombre: "Di Rosa Formulaciones" },
            destinatario: [
                {
                    nombre: input.destinatario.nombre,
                    apellido: input.destinatario.apellido ?? "",
                    email: input.destinatario.email ?? "",
                    telefono: input.destinatario.telefono ?? "",
                    documento: input.destinatario.dni ?? "",
                },
            ],
            bultos:
                input.bultos?.length
                    ? input.bultos.map((b) => ({
                        peso: b.peso ?? 0.5,
                        largo: b.largo ?? 10,
                        alto: b.alto ?? 10,
                        ancho: b.ancho ?? 10,
                        valorDeclarado: b.valorDeclarado ?? 0,
                    }))
                    : [{ peso: 0.5, largo: 10, alto: 10, ancho: 10, valorDeclarado: 0 }],
        }),
        cache: "no-store",
    })

    const rawText = await res.text()

    if (!res.ok) {
        throw new Error(`Andreani create order falló (${res.status}): ${rawText || "sin body"}`)
    }

    return { rawText }
}

export function extractTracking(rawText: string): string | null {
    const t = (rawText || "").trim()
    if (!t) return null

    // si te devuelve algo tipo "123456789" o "OK 123..."
    const match = t.match(/(\d{8,})/)
    if (match?.[1]) return match[1]

    // si no, devolvemos el texto completo como fallback
    return t
}

export function extractPdfBase64(rawText: string): string | null {
    // Si alguna vez te devuelve base64 del PDF, suele arrancar con "JVBERi0" (PDF)
    const t = (rawText || "").trim()
    if (t.includes("JVBERi0")) {
        const idx = t.indexOf("JVBERi0")
        return t.slice(idx)
    }
    return null
}
