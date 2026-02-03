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

/**
 * Crea una preferencia de pago en Mercado Pago
 */
export async function crearPreferencia(payload: any) {
  // Aseguramos que la URL base no tenga una barra al final para evitar // en la URL
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

  // Es vital que el pedidoId llegue en metadata desde create-order
  const pedidoId = payload.metadata?.pedidoId;

  if (!pedidoId) {
    console.error('❌ Error: Se intentó crear una preferencia sin pedidoId en metadata.');
    throw new Error('Falta el ID del pedido para procesar el pago.');
  }

  // Armamos el body asegurando que los tipos sean correctos para la API de MP
  const body: any = {
    items: payload.items.map((it: any) => ({
      ...it,
      unit_price: Number(it.unit_price) // Forzamos que sea número
    })),
    payer: {
      name: payload.payer?.name || '',
      surname: payload.payer?.surname || '',
      email: payload.payer?.email || '',
    },
    notification_url: `${baseUrl}/api/mercadopago/webhook`,
    external_reference: String(payload.external_reference),
    metadata: payload.metadata,
    statement_descriptor: 'DI ROSA FORMULACIONES',
    back_urls: {
      success: `${baseUrl}/checkout/confirmacion/${pedidoId}?status=approved`,
      failure: `${baseUrl}/checkout/confirmacion/${pedidoId}?status=rejected`,
      pending: `${baseUrl}/checkout/confirmacion/${pedidoId}?status=pending`,
    },
    // No usamos auto_return para evitar el error de validación estricta en localhost
  };

  try {
    console.log('🎯 Intentando crear preferencia para Pedido ID:', pedidoId);

    const preferenceResponse = await preference.create({ body });

    console.log('✅ Preferencia creada exitosamente:', preferenceResponse.id);

    return {
      id: preferenceResponse.id,
      init_point: preferenceResponse.init_point,
      sandbox_init_point: preferenceResponse.sandbox_init_point,
    };
  } catch (error: any) {
    // Log detallado para saber EXACTAMENTE qué campo rechaza Mercado Pago
    console.error('❌ Error detallado al crear preferencia:', error.message);
    if (error.cause) console.error('Causa del error:', JSON.stringify(error.cause, null, 2));

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