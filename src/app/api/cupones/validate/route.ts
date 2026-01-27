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

    const emailCliente = body.email; // Asegurate de enviar el email desde el frontend al validar

    // 2. Si es un cupón de bienvenida o limitado por persona
    if (emailCliente) {
      const yaLoUso = await prisma.pedido.findFirst({
        where: {
          emailCliente: emailCliente,
          cuponCodigo: body.codigo.toUpperCase(),
          estado: { not: 'cancelled' } // Ignoramos si el pedido fue cancelado
        }
      })

      if (yaLoUso) {
        return NextResponse.json({
          valid: false,
          error: 'Ya has utilizado este cupón en una compra anterior'
        })
      }
    }
    if (!body.codigo || !body.subtotal) {
      return NextResponse.json(
        { valid: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    const cupon = await prisma.cupon.findUnique({
      where: { codigo: body.codigo.toUpperCase() }
    })

    if (!cupon) {
      return NextResponse.json({ valid: false, error: 'Cupón no encontrado' })
    }

    if (!cupon.activo) {
      return NextResponse.json({ valid: false, error: 'Este cupón ya no está disponible' })
    }

    // Validar fecha de vencimiento
    if (cupon.fechaVencimiento && new Date() > new Date(cupon.fechaVencimiento)) {
      return NextResponse.json({ valid: false, error: 'Este cupón ha expirado' })
    }

    // Validar límite de usos
    if (cupon.fechaVencimiento && new Date() > new Date(cupon.fechaVencimiento)) {
      // Solo entra aquí si la fecha EXISTE. Si es null, el cupón sigue siendo válido.
      return NextResponse.json({ valid: false, error: 'Este cupón ha alcanzado su límite de usos' })
    }

    // Validar monto mínimo
    if (cupon.montoMinimo && body.subtotal < cupon.montoMinimo) {
      return NextResponse.json({
        valid: false,
        error: `Compra mínima de $${cupon.montoMinimo.toLocaleString('es-AR')} requerida`
      })
    }

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