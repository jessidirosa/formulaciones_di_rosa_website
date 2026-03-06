import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface ValidateCouponRequest {
  codigo: string
  email: string
  subtotal: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateCouponRequest = await request.json()
    const emailCliente = body.email;
    const codigoUpper = body.codigo?.toUpperCase();

    if (!codigoUpper || !body.subtotal) {
      return NextResponse.json(
        { valid: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // 1. Buscamos el cupón primero para conocer sus reglas
    const cupon = await prisma.cupon.findUnique({
      where: { codigo: codigoUpper }
    })

    if (!cupon) {
      return NextResponse.json({ valid: false, error: 'Cupón no encontrado' })
    }

    if (!cupon.activo) {
      return NextResponse.json({ valid: false, error: 'Este cupón ya no está disponible' })
    }

    // 2. Validar fecha de vencimiento
    if (cupon.fechaVencimiento && new Date() > new Date(cupon.fechaVencimiento)) {
      return NextResponse.json({ valid: false, error: 'Este cupón ha expirado' })
    }

    // 3. Validar límite de usos TOTALES
    if (cupon.limiteUsos && cupon.usos >= cupon.limiteUsos) {
      return NextResponse.json({ valid: false, error: 'Este cupón ha alcanzado su límite de usos totales' })
    }

    // 4. ✅ NUEVA LÓGICA: Validar usos POR CLIENTE
    // Solo validamos si emailCliente existe Y el cupón tiene usosPorCliente = 1
    if (emailCliente && cupon.usosPorCliente === 1) {
      const yaLoUso = await prisma.pedido.findFirst({
        where: {
          emailCliente: emailCliente,
          cuponCodigo: codigoUpper,
          estado: { notIn: ['cancelado', 'cancelled', 'expired'] } // Ignoramos si falló o expiró
        }
      })

      if (yaLoUso) {
        return NextResponse.json({
          valid: false,
          error: 'Ya has utilizado este cupón en una compra anterior'
        })
      }
    }

    // 5. Validar monto mínimo
    if (cupon.montoMinimo && body.subtotal < cupon.montoMinimo) {
      return NextResponse.json({
        valid: false,
        error: `Compra mínima de $${cupon.montoMinimo.toLocaleString('es-AR')} requerida`
      })
    }

    // Calcular descuento
    let descuentoAplicado = 0
    if (cupon.tipo === 'PORCENTAJE') {
      descuentoAplicado = Math.round((body.subtotal * cupon.valor) / 100)
    } else if (cupon.tipo === 'MONTO_FIJO') {
      descuentoAplicado = Math.min(cupon.valor, body.subtotal)
    }

    return NextResponse.json({
      valid: true,
      cupon: {
        codigo: cupon.codigo,
        descripcion: cupon.descripcion,
        tipo: cupon.tipo,
        valor: cupon.valor
      },
      descuentoAplicado,
      message: `¡Cupón ${cupon.codigo} aplicado!`
    })

  } catch (error) {
    console.error('Error al validar cupón:', error)
    return NextResponse.json({ valid: false, error: 'Error interno' }, { status: 500 })
  }
}