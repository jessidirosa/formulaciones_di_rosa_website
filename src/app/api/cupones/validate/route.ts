import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface ValidateCouponRequest {
  codigo: string
  subtotal: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateCouponRequest = await request.json()

    if (!body.codigo || !body.subtotal) {
      return NextResponse.json(
        { valid: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Buscar el cupón
    const cupon = await prisma.cupon.findUnique({
      where: { codigo: body.codigo.toUpperCase() }
    })

    if (!cupon) {
      return NextResponse.json({
        valid: false,
        error: 'Cupón no encontrado'
      })
    }

    // Validar si está activo
    if (!cupon.activo) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupón ya no está disponible'
      })
    }

    // Validar fecha de vencimiento
    if (cupon.fechaVencimiento && new Date() > cupon.fechaVencimiento) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupón ha expirado'
      })
    }

    // Validar límite de usos
    if (cupon.limiteUsos && cupon.usos >= cupon.limiteUsos) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupón ha alcanzado su límite de usos'
      })
    }

    // Validar monto mínimo
    if (cupon.montoMinimo && body.subtotal < cupon.montoMinimo) {
      return NextResponse.json({
        valid: false,
        error: `Compra mínima de $${cupon.montoMinimo.toLocaleString('es-AR')} requerida para este cupón`
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
      message: `Cupón aplicado correctamente. Descuento: $${descuentoAplicado.toLocaleString('es-AR')}`
    })

  } catch (error) {
    console.error('Error al validar cupón:', error)
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Error interno del servidor' 
      }, 
      { status: 500 }
    )
  }
}