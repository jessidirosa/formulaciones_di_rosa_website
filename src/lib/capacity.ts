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
 * Lógica central: Calcula el jueves de despacho según carga de trabajo y saltos manuales
 */
export async function calcularFechaEstimada(): Promise<Date> {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  let semanasAAgregar = config?.semanasDesplazadas || 0;

  let fechaEncontrada = false;
  let fechaFinal = new Date();

  while (!fechaEncontrada) {
    // 1. Apuntamos al jueves de la semana base + semanas de salto
    const hoy = new Date();
    const lunesBase = addDays(startOfWeek(hoy, { weekStartsOn: 1 }), 7);
    const juevesIntento = addDays(addWeeks(lunesBase, semanasAAgregar), 3);

    // 2. Contamos cuántos hay para ese jueves específico
    const ocupados = await prisma.pedido.count({
      where: {
        estado: { in: ESTADOS_CAPACIDAD },
        fechaEstimadaEnvio: {
          gte: new Date(juevesIntento.setHours(0, 0, 0, 0)),
          lte: new Date(juevesIntento.setHours(23, 59, 59, 999))
        }
      }
    });

    // 3. Si hay lugar, esa es la fecha. Si está lleno, probamos la semana siguiente.
    if (ocupados < CAPACIDAD_SEMANAL) {
      fechaFinal = juevesIntento;
      fechaEncontrada = true;
    } else {
      semanasAAgregar++;
    }
  }

  return fechaFinal;
}
/**
 * Exportación para el Panel de Admin
 */
export async function obtenerResumenCapacidad() {
  try {
    // 1. Obtenemos la configuración de saltos (el botón que agregamos antes)
    const config = await prisma.config.findUnique({ where: { id: 1 } });
    const semanasSaltadas = config?.semanasDesplazadas || 0;

    // 2. Calculamos cuál es la fecha del PRÓXIMO despacho disponible
    // Esta función ya considera la carga de trabajo y los saltos manuales
    const proximaFecha = await calcularFechaEstimada();

    // 3. NUEVA LÓGICA: Contamos cuántos pedidos ya tienen asignada ESA fecha exacta
    const pedidosEnEsaFecha = await prisma.pedido.count({
      where: {
        estado: { in: ESTADOS_CAPACIDAD },
        fechaEstimadaEnvio: {
          // Buscamos pedidos que coincidan con el día (sin importar la hora)
          gte: new Date(proximaFecha.setHours(0, 0, 0, 0)),
          lte: new Date(proximaFecha.setHours(23, 59, 59, 999))
        }
      },
    })

    const capacidadDisponible = Math.max(0, CAPACIDAD_SEMANAL - pedidosEnEsaFecha)

    return {
      capacidadTotal: CAPACIDAD_SEMANAL,
      pedidosPendientes: pedidosEnEsaFecha, // Ahora representa los de ESTA fecha
      capacidadDisponible,
      proximaFechaEstimada: proximaFecha,
      semanasSaltadas
    }
  } catch (error) {
    console.error("❌ Error al obtener resumen:", error)
    return {
      capacidadTotal: CAPACIDAD_SEMANAL,
      pedidosPendientes: 0,
      capacidadDisponible: CAPACIDAD_SEMANAL,
      proximaFechaEstimada: new Date(),
      semanasSaltadas: 0
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

export function obtenerFraseElaboracion(): string {
  return "Cada producto es formulado y elaborado específicamente para vos, respetando los tiempos de preparación magistral."
}