import { NextResponse } from 'next/server'
import { calcularFechaEstimada } from '@/lib/capacity'

export async function GET() {
  try {
    const fechaEstimada = await calcularFechaEstimada()
    
    return NextResponse.json({
      success: true,
      fechaEstimada: fechaEstimada.toISOString()
    })
  } catch (error) {
    console.error('❌ Error al calcular fecha estimada:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al calcular fecha estimada' 
      }, 
      { status: 500 }
    )
  }
}