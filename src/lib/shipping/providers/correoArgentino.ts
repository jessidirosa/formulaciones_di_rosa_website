import { ShippingProvider } from "./types"

export const correoArgentinoProvider: ShippingProvider = {
    carrier: "CORREO_ARGENTINO",
    async createLabel(_input) {
        // TODO: integrar API real con credenciales
        return {
            trackingCode: "CA123456789AR",
            trackingUrl: "https://www.correoargentino.com.ar/formularios/e-commerce?id=CA123456789AR",
            labelUrl: "https://labels.example.com/CA123456789AR.pdf",
        }
    },
}
