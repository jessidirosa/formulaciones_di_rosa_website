'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CheckoutData } from '@/app/checkout/page'
import { CreditCard, Gift, Loader2, ShieldCheck, Landmark, Sparkles, ArrowRight } from 'lucide-react'

interface PaymentSectionProps {
  data: CheckoutData
  onChange: (data: Partial<CheckoutData>) => void
  onSubmit: () => Promise<void>
  onBack: () => void
  isProcessing: boolean
  total: number
}

export default function PaymentSection({
  data,
  onChange,
  onSubmit,
  onBack,
  isProcessing,
  total
}: PaymentSectionProps) {
  const [cuponCode, setCuponCode] = useState(data.cuponCodigo || '')
  const [cuponLoading, setCuponLoading] = useState(false)
  const [cuponError, setCuponError] = useState('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const applyCoupon = async () => {
    if (!cuponCode.trim()) return
    setCuponLoading(true)
    setCuponError('')

    try {
      const response = await fetch('/api/cupones/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: cuponCode.trim().toUpperCase(),
          subtotal: total
        })
      })

      const result = await response.json()

      if (response.ok && result.valid) {
        onChange({
          cuponCodigo: result.cupon.codigo,
          cuponDescuento: result.descuentoAplicado
        })
      } else {
        setCuponError(result.error || 'Cupón no válido')
        onChange({ cuponCodigo: undefined, cuponDescuento: undefined })
      }
    } catch (error) {
      setCuponError('Error al validar el cupón')
    } finally {
      setCuponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCuponCode('')
    setCuponError('')
    onChange({ cuponCodigo: undefined, cuponDescuento: undefined })
  }

  const metodoPago = data.metodoPago || 'MERCADOPAGO'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* SECCIÓN: CUPÓN */}
      <div className="bg-[#F9F9F7] p-6 rounded-2xl border border-[#E9E9E0] space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-[#A3B18A]" />
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#4A5D45]">
            Código de Beneficio
          </h3>
        </div>

        {data.cuponCodigo ? (
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#D6D6C2] shadow-sm">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#4A5D45] text-white border-none rounded-lg px-3">
                {data.cuponCodigo}
              </Badge>
              <p className="text-xs font-bold text-[#4A5D45]">
                Ahorras {formatPrice(data.cuponDescuento || 0)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeCoupon}
              className="text-[#A3B18A] hover:text-red-500 text-[10px] font-bold uppercase"
            >
              Remover
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={cuponCode}
              onChange={(e) => setCuponCode(e.target.value.toUpperCase())}
              placeholder="EJ: DIROSA10"
              className={`bg-white border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${cuponError ? 'border-red-400' : ''}`}
              disabled={cuponLoading}
            />
            <Button
              type="button"
              onClick={applyCoupon}
              disabled={cuponLoading || !cuponCode.trim()}
              className="bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-xl h-11 px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              {cuponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
            </Button>
          </div>
        )}
        {cuponError && <p className="text-[10px] text-red-500 font-bold italic px-1">{cuponError}</p>}
      </div>

      {/* SECCIÓN: MÉTODOS DE PAGO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#A3B18A]" />
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#4A5D45]">
            Medio de Pago Seguro
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mercado Pago */}
          <div
            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group
              ${metodoPago === 'MERCADOPAGO' ? 'border-[#4A5D45] bg-[#F9F9F7] shadow-md' : 'border-[#E9E9E0] bg-white hover:border-[#D6D6C2]'}`}
            onClick={() => onChange({ metodoPago: 'MERCADOPAGO' })}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${metodoPago === 'MERCADOPAGO' ? 'bg-[#4A5D45] text-white' : 'bg-[#F5F5F0] text-[#A3B18A]'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              {metodoPago === 'MERCADOPAGO' && <div className="w-2 h-2 rounded-full bg-[#4A5D45] animate-pulse" />}
            </div>
            <h4 className="font-bold text-[#3A4031] text-sm uppercase tracking-tight">Mercado Pago</h4>
            <p className="text-[10px] text-[#5B6350] mt-1 italic">Tarjetas, Débito y Dinero en cuenta</p>
          </div>

          {/* Transferencia */}
          <div
            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group
              ${metodoPago === 'TRANSFERENCIA' ? 'border-[#A3B18A] bg-[#F9F9F7] shadow-md' : 'border-[#E9E9E0] bg-white hover:border-[#D6D6C2]'}`}
            onClick={() => onChange({ metodoPago: 'TRANSFERENCIA', aplicarDescuentoTransfer: true })}
          >
            <div className="absolute -top-1 -right-1 bg-[#A3B18A] text-white px-3 py-1 text-[9px] font-bold rounded-bl-xl uppercase tracking-tighter">
              10% OFF
            </div>
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${metodoPago === 'TRANSFERENCIA' ? 'bg-[#A3B18A] text-white' : 'bg-[#F5F5F0] text-[#A3B18A]'}`}>
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            <h4 className="font-bold text-[#3A4031] text-sm uppercase tracking-tight">Transferencia</h4>
            <p className="text-[10px] text-[#5B6350] mt-1 italic">Con descuento • Tenés 1 hora para pagar</p>
          </div>
        </div>
      </div>

      {/* BLOQUE DE SEGURIDAD */}
      <div className="bg-[#E9E9E0]/40 border border-[#D6D6C2] rounded-2xl p-4">
        <div className="flex items-center gap-3 text-[#4A5D45] mb-2 font-bold text-[10px] uppercase tracking-widest">
          <ShieldCheck className="h-4 w-4" /> Transacción Protegida por SSL
        </div>
        <p className="text-[10px] text-[#5B6350] leading-relaxed">
          Los datos de tu tarjeta son procesados exclusivamente por <strong>Mercado Pago</strong>.
          Laboratorio Di Rosa no almacena información sensible de pago en sus servidores.
        </p>
      </div>

      <Separator className="bg-[#F5F5F0]" />

      {/* TOTAL Y ACCIÓN */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A3B18A]">Total a Liquidar</p>
          <div className="text-4xl font-serif font-bold text-[#4A5D45]">
            {formatPrice(total)}
          </div>
          {(data.cuponDescuento || data.aplicarDescuentoTransfer) && (
            <div className="flex flex-col items-center gap-1 pt-2">
              {data.cuponDescuento && (
                <Badge variant="outline" className="border-[#A3B18A] text-[#4A5D45] text-[9px] uppercase font-bold px-3 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1" /> Cupón: -{formatPrice(data.cuponDescuento)}
                </Badge>
              )}
              {data.aplicarDescuentoTransfer && (
                <Badge variant="outline" className="border-[#A3B18A] text-[#4A5D45] text-[9px] uppercase font-bold px-3 py-0.5">
                  ✔ Beneficio Transferencia (-10%)
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 text-[#A3B18A] hover:text-[#4A5D45] hover:bg-transparent text-xs font-bold uppercase tracking-widest"
          >
            ← Volver a Entrega
          </Button>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={isProcessing}
            className="flex-[2] bg-[#4A5D45] hover:bg-[#3A4031] text-white h-16 rounded-2xl font-bold uppercase tracking-[0.15em] text-sm shadow-xl shadow-emerald-900/10 transition-all active:scale-[0.98]"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Finalizar Compra <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </div>

      <p className="text-[9px] text-[#A3B18A] text-center uppercase tracking-widest font-medium">
        Al confirmar, aceptas nuestros Términos y condiciones y nuestra Política de privacidad.
      </p>
    </div>
  )
}