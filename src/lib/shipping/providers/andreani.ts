import { ShippingProvider } from "./types"

export const andreaniProvider = {
    carrier: "ANDREANI",
    async createLabel(_input: unknown) {
        // TODO: integrar API real con credenciales
        return {
            trackingCode: "AND123456789",
            trackingUrl: "https://seguimiento.andreani.com/AND123456789",
            labelUrl: "https://labels.example.com/AND123456789.pdf",
        }
    },
}
