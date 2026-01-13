export type Carrier = "CORREO_ARGENTINO" | "ANDREANI"

export type ShippingLabelResult = {
    trackingCode: string
    trackingUrl?: string | null
    labelUrl: string
}

export interface ShippingProvider {
    carrier: Carrier
    createLabel(input: any): Promise<ShippingLabelResult>
}
