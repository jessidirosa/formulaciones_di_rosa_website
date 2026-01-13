import { correoArgentinoProvider } from "./providers/correoArgentino"
import { andreaniProvider } from "./providers/andreani"
import type { Carrier, ShippingProvider } from "./providers/types"

const providers: Record<Carrier, ShippingProvider> = {
    CORREO_ARGENTINO: correoArgentinoProvider,
    ANDREANI: andreaniProvider as any,
}

export function getProvider(carrier: Carrier) {
    return providers[carrier]
}
