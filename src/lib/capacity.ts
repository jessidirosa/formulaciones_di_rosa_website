import { addWeeks, nextMonday, isWeekend, format } from 'date-fns'
import { es } from 'date-fns/locale'
import prisma from './prisma'

// Constantes de configuración
export const CAPACIDAD_SEMANAL = parseInt(process.env.CAPACIDAD_SEMANAL || '17')

/**
 * Calcula la fecha estimada de envío/retiro basada en la capacidad semanal
 * y los pedidos pendientes/en producción
 */
export async function calcularFechaEstimada(): Promise<Date> {
  try {
    // 1. Contar pedidos pendientes y en producción
    const pedidosPendientes = await prisma.pedido.count({
      where: {
        estado: {
          in: ['PENDIENTE', 'PAGADO', 'EN_PRODUCCION']
        }
      }
    })

    console.log(`📊 Pedidos pendientes/en producción: ${pedidosPendientes}`)
    console.log(`📈 Capacidad semanal configurada: ${CAPACIDAD_SEMANAL}`)

    // 2. Calcular semanas de offset
    const semanaOffset = Math.floor(pedidosPendientes / CAPACIDAD_SEMANAL)
    
    // 3. Fecha base (hoy)
    const fechaBase = new Date()
    
    // 4. Agregar semanas offset
    const fechaEstimada = addWeeks(fechaBase, semanaOffset)
    
    // 5. Ajustar a día hábil si es necesario
    const fechaFinal = ajustarADiaHabil(fechaEstimada)
    
    console.log(`🎯 Fecha estimada calculada: ${format(fechaFinal, 'dd/MM/yyyy', { locale: es })}`)
    
    return fechaFinal
  } catch (error) {
    console.error('❌ Error al calcular fecha estimada:', error)
    // En caso de error, devolver fecha base + 1 semana
    return ajustarADiaHabil(addWeeks(new Date(), 1))
  }
}

/**
 * Ajusta una fecha a un día hábil (lunes a viernes)
 * Si cae en fin de semana, la mueve al lunes siguiente
 */
export function ajustarADiaHabil(fecha: Date): Date {
  if (isWeekend(fecha)) {
    return nextMonday(fecha)
  }
  return fecha
}

/**
 * Obtiene un resumen de la capacidad actual del sistema
 */
export async function obtenerResumenCapacidad() {
  try {
    const pedidosPendientes = await prisma.pedido.count({
      where: {
        estado: {
          in: ['PENDIENTE', 'PAGADO', 'EN_PRODUCCION']
        }
      }
    })

    const pedidosEstaSemanaPorEstado = await prisma.pedido.groupBy({
      by: ['estado'],
      _count: {
        estado: true
      },
      where: {
        estado: {
          in: ['PENDIENTE', 'PAGADO', 'EN_PRODUCCION']
        }
      }
    })

    const capacidadUsada = pedidosPendientes
    const capacidadDisponible = Math.max(0, CAPACIDAD_SEMANAL - (capacidadUsada % CAPACIDAD_SEMANAL))
    const semanasDeRetraso = Math.floor(capacidadUsada / CAPACIDAD_SEMANAL)

    return {
      capacidadTotal: CAPACIDAD_SEMANAL,
      capacidadUsada,
      capacidadDisponible,
      semanasDeRetraso,
      pedidosPorEstado: pedidosEstaSemanaPorEstado,
      proximaFechaEstimada: await calcularFechaEstimada()
    }
  } catch (error) {
    console.error('❌ Error al obtener resumen de capacidad:', error)
    return {
      capacidadTotal: CAPACIDAD_SEMANAL,
      capacidadUsada: 0,
      capacidadDisponible: CAPACIDAD_SEMANAL,
      semanasDeRetraso: 0,
      pedidosPorEstado: [],
      proximaFechaEstimada: new Date()
    }
  }
}

/**
 * Formatea una fecha en formato argentino (dd/mm/yyyy)
 */
export function formatearFechaArgentina(fecha: Date): string {
  return format(fecha, 'dd/MM/yyyy', { locale: es })
}

/**
 * Formatea una fecha en formato completo en español
 */
export function formatearFechaCompleta(fecha: Date): string {
  return format(fecha, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })
}