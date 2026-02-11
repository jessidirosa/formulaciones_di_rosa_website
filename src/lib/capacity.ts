import { addWeeks, addDays, startOfWeek, isWeekend, nextMonday, format } from "date-fns"
import { es } from "date-fns/locale"
import prisma from "./prisma"

// 1. Configuración de capacidad (usa el .env o 17 por defecto)
export const CAPACIDAD_SEMANAL = parseInt(process.env.CAPACIDAD_SEMANAL || "17", 10)

// 2. Estados que "consumen" el cupo de producción
const ESTADOS_CAPACIDAD = [
  "confirmado",
  "en_produccion",
  "listo_envio",
  "pending_payment_transfer",
  "transfer_proof_sent"
]

/**
 * Lógica central: Calcula el jueves de despacho según carga de trabajo
 */
export async function calcularFechaEstimada(): Promise<Date> {
  try {
    const pedidosPendientes = await prisma.pedido.count({
      where: { estado: { in: ESTADOS_CAPACIDAD } },
    })

    // 0..16 pedidos -> semana 0 (próxima), 17..33 -> semana 1, etc.
    const semanasDeRetraso = Math.floor(pedidosPendientes / CAPACIDAD_SEMANAL)

    const hoy = new Date()
    // Siempre apuntamos al lunes de la SEMANA QUE VIENE como base
    const lunesProximaSemana = addDays(startOfWeek(hoy, { weekStartsOn: 1 }), 7)

    // Sumamos las semanas de retraso y vamos al jueves (+3 días)
    const lunesAsignado = addWeeks(lunesProximaSemana, semanasDeRetraso)
    const juevesEstimado = addDays(lunesAsignado, 3)

    return juevesEstimado
  } catch (error) {
    console.error("❌ Error al calcular fecha estimada:", error)
    // Fallback: Jueves de la semana que viene
    return addDays(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7), 3)
  }
}

/**
 * Exportación para el Panel de Admin
 */
export async function obtenerResumenCapacidad() {
  try {
    const pedidosPendientes = await prisma.pedido.count({
      where: { estado: { in: ESTADOS_CAPACIDAD } },
    })

    const capacidadUsadaEnSemanaActual = pedidosPendientes % CAPACIDAD_SEMANAL
    const capacidadDisponible = Math.max(0, CAPACIDAD_SEMANAL - capacidadUsadaEnSemanaActual)
    const proximaFecha = await calcularFechaEstimada()

    return {
      capacidadTotal: CAPACIDAD_SEMANAL,
      pedidosPendientes,
      capacidadDisponible,
      proximaFechaEstimada: proximaFecha,
    }
  } catch (error) {
    console.error("❌ Error al obtener resumen:", error)
    return {
      capacidadTotal: CAPACIDAD_SEMANAL,
      pedidosPendientes: 0,
      capacidadDisponible: CAPACIDAD_SEMANAL,
      proximaFechaEstimada: new Date(),
    }
  }
}

/**
 * Formateadores de fecha consistentes
 */
export function formatearFechaArgentina(fecha: Date): string {
  return format(fecha, "dd/MM/yyyy", { locale: es })
}

export function formatearRangoDeFecha(fechaCentral: Date): string {
  const inicio = addDays(fechaCentral, -3) // Miércoles
  const fin = addDays(fechaCentral, 1)    // Viernes

  const diaInicio = format(inicio, "d")
  const diaFin = format(fin, "d")
  const mes = format(fin, "MMMM", { locale: es })

  return `${diaInicio} al ${diaFin} de ${mes}`
}

/**
 * Frase personalizada para el cliente
 */
export function obtenerFraseElaboracion(): string {
  return "Cada producto es formulado y elaborado específicamente para vos, respetando los tiempos de preparación magistral."
}