'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckoutData } from '@/app/checkout/page'
import { CreditCard, Gift, Loader2, ShieldCheck, Landmark, Sparkles, ArrowRight, X } from 'lucide-react'
import { toast } from 'sonner'

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
      maximumFractionDigits: 0
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
          subtotal: total,
          // ✅ Enviamos el email que YA está en el estado 'data'
          email: data.emailCliente
        })
      })

      const result = await response.json()

      if (response.ok && result.valid) {
        onChange({
          cuponCodigo: result.cupon.codigo,
          cuponDescuento: result.descuentoAplicado
        })
        toast.success(result.message)
      } else {
        setCuponError(result.error || 'Cupón no válido')
        onChange({ cuponCodigo: "", cuponDescuento: 0 })
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
    onChange({ cuponCodigo: "", cuponDescuento: 0 })
    toast.info("Cupón removido")
  }

  const handleMethodChange = (metodo: 'MERCADOPAGO' | 'TRANSFERENCIA') => {
    onChange({
      metodoPago: metodo,
      aplicarDescuentoTransfer: metodo === 'TRANSFERENCIA'
    })
  }

  const metodoPago = data.metodoPago || 'MERCADOPAGO'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
      {/* SECCIÓN: CUPÓN */}
      <div className="bg-[#F9F9F7] p-6 rounded-3xl border border-[#E9E9E0] space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-[#A3B18A]" />
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4A5D45]">Código de Beneficio</h3>
        </div>

        {data.cuponCodigo ? (
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#A3B18A] shadow-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-[#4A5D45] text-white p-2 rounded-lg"><Sparkles className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#A3B18A] leading-none mb-1">Cupón Activo</p>
                <p className="text-sm font-bold text-[#4A5D45] uppercase">{data.cuponCodigo}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-[#4A5D45] border-r pr-4 border-gray-100">-{formatPrice(data.cuponDescuento || 0)}</span>
              <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={cuponCode || ""} // ✅ Evita el error de uncontrolled input
              onChange={(e) => setCuponCode(e.target.value.toUpperCase())}
              placeholder="INGRESÁ TU CÓDIGO"
              className="rounded-2xl h-12 border-[#E9E9E0]"
              disabled={cuponLoading}
            />
            <Button type="button" onClick={applyCoupon} disabled={cuponLoading || !cuponCode.trim()} className="bg-[#4A5D45] text-white rounded-2xl h-12 px-8 uppercase text-[10px] font-bold tracking-widest">
              {cuponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}
            </Button>
          </div>
        )}
        {cuponError && <p className="text-[10px] text-red-500 font-bold italic px-2">⚠ {cuponError}</p>}
      </div>

      {/* SECCIÓN: MÉTODOS DE PAGO */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`cursor-pointer p-6 rounded-3xl border-2 transition-all ${metodoPago === 'MERCADOPAGO' ? 'border-[#4A5D45] bg-white shadow-lg' : 'border-transparent bg-white/50 opacity-70'}`} onClick={() => handleMethodChange('MERCADOPAGO')}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${metodoPago === 'MERCADOPAGO' ? 'bg-[#4A5D45] text-white' : 'bg-gray-100 text-gray-400'}`}><CreditCard className="w-5 h-5" /></div>
            <h4 className="font-bold text-[#3A4031] text-sm uppercase">Mercado Pago</h4>
          </div>

          <div className={`cursor-pointer p-6 rounded-3xl border-2 transition-all ${metodoPago === 'TRANSFERENCIA' ? 'border-[#A3B18A] bg-white shadow-lg' : 'border-transparent bg-white/50 opacity-70'}`} onClick={() => handleMethodChange('TRANSFERENCIA')}>
            <div className="absolute top-4 right-4 bg-[#A3B18A] text-white px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-widest animate-pulse">10% OFF</div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${metodoPago === 'TRANSFERENCIA' ? 'bg-[#A3B18A] text-white' : 'bg-gray-100 text-gray-400'}`}><Landmark className="w-5 h-5" /></div>
            <h4 className="font-bold text-[#3A4031] text-sm uppercase">Transferencia</h4>
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-[#E9E9E0] my-8" />

      <div className="space-y-6">
        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#A3B18A]">Total Final</p>
          <div className="text-5xl font-serif font-bold text-[#4A5D45]">{formatPrice(total)}</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isProcessing} className="flex-1 text-gray-400 uppercase text-xs font-bold tracking-widest h-14">← Volver</Button>
          <Button type="button" onClick={onSubmit} disabled={isProcessing} className="flex-[2] bg-[#4A5D45] text-white h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-900/20">
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="flex items-center gap-3">Finalizar Compra <ArrowRight className="w-4 h-4" /></span>}
          </Button>
        </div>
      </div>
    </div>
  )
}