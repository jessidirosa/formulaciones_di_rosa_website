// Cliente Mercado Pago para el backend
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

// Configuración del cliente MP (solo backend)
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000
  }
})

// Instancias de las APIs
export const payment = new Payment(client)
export const preference = new Preference(client)

// Tipos para TypeScript
export interface PreferenceItem {
  id: string
  title: string
  quantity: number
  currency_id: string
  unit_price: number
  description?: string
  picture_url?: string
}

export interface PreferencePayload {
  items: PreferenceItem[]
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: 'approved' | 'all'
  external_reference: string
  notification_url?: string
  payer?: {
    name?: string
    surname?: string
    email?: string
    phone?: {
      area_code?: string
      number?: string
    }
    address?: {
      zip_code?: string
      street_name?: string
      street_number?: string
    }
  }
  payment_methods?: {
    excluded_payment_types?: Array<{ id: string }>
    excluded_payment_methods?: Array<{ id: string }>
    installments?: number
  }
  shipments?: {
    cost?: number
    mode?: string
  }
}

/**
 * Crea una preferencia de pago en Mercado Pago
 */
export async function crearPreferencia(payload: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Armamos un body MINIMAL para Mercado Pago,
  // sin auto_return así no molesta.
  const body: any = {
    items: payload.items,
    payer: payload.payer,
    notification_url: `${baseUrl}/api/mercadopago/webhook`,
    external_reference: payload.external_reference,
    payment_methods: payload.payment_methods,
    metadata: payload.metadata,
    // si querés, también podés mandar statement_descriptor:
    statement_descriptor: 'FORMULACIONES DI ROSA',
  };

  try {
    console.log('🎯 Creando preferencia en Mercado Pago:', {
      items: body.items?.length,
      external_reference: body.external_reference,
    });

    const preferenceResponse = await preference.create({ body });

    console.log('✅ Preferencia creada exitosamente:', preferenceResponse.id);

    return {
      id: preferenceResponse.id,
      init_point: preferenceResponse.init_point,
      sandbox_init_point: preferenceResponse.sandbox_init_point,
    };
  } catch (error) {
    console.error('❌ Error al crear preferencia:', error);
    throw new Error('Error al crear preferencia de pago');
  }
}



/**
 * Obtiene información de un pago por su ID
 */
export async function obtenerPago(paymentId: string) {
  try {
    const paymentInfo = await payment.get({ id: paymentId })
    return paymentInfo
  } catch (error) {
    console.error('❌ Error al obtener pago:', error)
    throw new Error('Error al obtener información del pago')
  }
}

/**
 * Estados de pago de Mercado Pago
 */
export const ESTADOS_PAGO_MP = {
  PENDING: 'pending',
  APPROVED: 'approved',
  AUTHORIZED: 'authorized',
  IN_PROCESS: 'in_process',
  IN_MEDIATION: 'in_mediation',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHARGED_BACK: 'charged_back'
} as const

/**
 * Mapea estados de Mercado Pago a nuestros estados internos
 */
export function mapearEstadoPago(estadoMP: string): 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO' | 'REEMBOLSADO' {
  switch (estadoMP) {
    case ESTADOS_PAGO_MP.APPROVED:
    case ESTADOS_PAGO_MP.AUTHORIZED:
      return 'APROBADO'
    case ESTADOS_PAGO_MP.PENDING:
    case ESTADOS_PAGO_MP.IN_PROCESS:
    case ESTADOS_PAGO_MP.IN_MEDIATION:
      return 'PENDIENTE'
    case ESTADOS_PAGO_MP.REJECTED:
      return 'RECHAZADO'
    case ESTADOS_PAGO_MP.CANCELLED:
      return 'CANCELADO'
    case ESTADOS_PAGO_MP.REFUNDED:
    case ESTADOS_PAGO_MP.CHARGED_BACK:
      return 'REEMBOLSADO'
    default:
      return 'PENDIENTE'
  }
}

export default client