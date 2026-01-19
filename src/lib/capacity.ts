// src/lib/capacity.ts
import { addWeeks, addDays, startOfWeek, nextMonday, isWeekend, format } from "date-fns"
import { es } from "date-fns/locale"
import prisma from "./prisma"

// Config
export const CAPACIDAD_SEMANAL = parseInt(process.env.CAPACIDAD_SEMANAL || "17", 10)

// Estados que "consumen capacidad" (producción/pendientes)
const ESTADOS_CAPACIDAD = ["pendiente", "pagado", "en_produccion", "pending_payment_transfer"]

/**
 * Ajusta una fecha a día hábil (lun-vie).
 * Si cae sábado/domingo → mueve al lunes siguiente.
 */
export function ajustarADiaHabil(fecha: Date): Date {
  if (isWeekend(fecha)) return nextMonday(fecha)
  return fecha
}

/**
 * Semana base:
 * - siempre usamos el próximo lunes
  */
function obtenerLunesSemanaBase(hoy = new Date()): Date {
  const base = startOfWeek(hoy, { weekStartsOn: 1 }) // lunes de esta semana

  return addDays(base, 7);
}

/**
 * Calcula fecha estimada (con cupos semanales) + colchón de 3 días.
 * Regla:
 * - Asignás el pedido a la semanaOffset (0 = semana base, 1 = siguiente, etc.)
 * - Fecha estimada = lunes de la semana asignada + 3 días (colchón)
 * - Ajuste a día hábil
 */
export async function calcularFechaEstimada(): Promise<Date> {
  try {
    const pedidosPendientes = await prisma.pedido.count({
      where: { estado: { in: ESTADOS_CAPACIDAD } },
    })

    console.log(`📊 Pedidos que consumen capacidad: ${pedidosPendientes}`)
    console.log(`📈 Capacidad semanal: ${CAPACIDAD_SEMANAL}`)

    // 0..16 → semana 0, 17..33 → semana 1, etc.
    const semanaOffset = Math.floor(pedidosPendientes / CAPACIDAD_SEMANAL)

    const lunesBase = obtenerLunesSemanaBase(new Date())
    const lunesAsignado = addWeeks(lunesBase, semanaOffset)

    // colchón +3 días dentro de esa semana (lunes + 3 = jueves)
    const conColchon = addDays(lunesAsignado, 3)

    const fechaFinal = ajustarADiaHabil(conColchon)

    console.log(
      `🎯 Fecha estimada: ${format(fechaFinal, "dd/MM/yyyy", { locale: es })} (offset semanas=${semanaOffset})`
    )

    return fechaFinal
  } catch (error) {
    console.error("❌ Error al calcular fecha estimada:", error)
    // fallback: próximo lunes + 3 días
    const fallback = addDays(obtenerLunesSemanaBase(new Date()), 3)
    return ajustarADiaHabil(fallback)
  }
}

/**
 * Resumen de capacidad actual
 */
export async function obtenerResumenCapacidad() {
  try {
    const pedidosPendientes = await prisma.pedido.count({
      where: { estado: { in: ESTADOS_CAPACIDAD } },
    })

    const pedidosPorEstado = await prisma.pedido.groupBy({
      by: ["estado"],
      _count: { estado: true },
      where: { estado: { in: ESTADOS_CAPACIDAD } },
    })

    const capacidadUsada = pedidosPendientes
    const capacidadDisponible = Math.max(0, CAPACIDAD_SEMANAL - (capacidadUsada % CAPACIDAD_SEMANAL))
    const semanasDeRetraso = Math.floor(capacidadUsada / CAPACIDAD_SEMANAL)

    return {
      capacidadTotal: CAPACIDAD_SEMANAL,
      capacidadUsada,
      capacidadDisponible,
      semanasDeRetraso,
      pedidosPorEstado,
      proximaFechaEstimada: await calcularFechaEstimada(),
    }
  } catch (error) {
    console.error("❌ Error al obtener resumen de capacidad:", error)
    return {
      capacidadTotal: CAPACIDAD_SEMANAL,
      capacidadUsada: 0,
      capacidadDisponible: CAPACIDAD_SEMANAL,
      semanasDeRetraso: 0,
      pedidosPorEstado: [],
      proximaFechaEstimada: new Date(),
    }
  }
}

export function formatearFechaArgentina(fecha: Date): string {
  return format(fecha, "dd/MM/yyyy", { locale: es })
}

export function formatearFechaCompleta(fecha: Date): string {
  return format(fecha, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })
}
