'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckoutData } from '@/app/checkout/page'
import { Truck, MapPin, Clock, DollarSign, Bike, ChevronRight, Store } from 'lucide-react'

interface ShippingOptionsProps {
  data: CheckoutData
  onChange: (data: Partial<CheckoutData>) => void
  onNext: () => void
  onBack: () => void
}

const CARRIERS = [
  { value: 'CORREO_ARGENTINO', label: 'Correo Argentino' },
  { value: 'ANDREANI', label: 'Andreani' },
] as const

export default function ShippingOptions({
  data,
  onChange,
  onNext,
  onBack,
}: ShippingOptionsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validación para Envío a Domicilio y Moto
    if (data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'MOTOMENSAJERIA') {
      if (!data.direccion?.trim()) newErrors.direccion = 'La dirección es requerida'
      if (!data.ciudad?.trim()) newErrors.ciudad = 'La ciudad es requerida'
      if (!data.ciudad?.trim()) newErrors.ciudad = 'La ciudad es requerida'
      if (!data.provincia?.trim()) newErrors.provincia = 'La provincia es requerida'
      if (!data.codigoPostal?.trim()) {
        newErrors.codigoPostal = 'El código postal es requerido'
      } else if (!/^\d{4}$/.test(data.codigoPostal)) {
        newErrors.codigoPostal = 'Formato inválido (4 dígitos)'
      }
    }

    // Validación para Sucursal Correo
    if (data.tipoEntrega === 'SUCURSAL_CORREO') {
      const okSucursal = Boolean((data.sucursalId && data.sucursalId.trim()) || (data.sucursalCorreo && data.sucursalCorreo.trim()))
      if (!okSucursal) newErrors.sucursalCorreo = 'La sucursal es requerida'
      if (!data.ciudad?.trim()) newErrors.ciudad = 'La ciudad es requerida'
      if (!data.provincia?.trim()) newErrors.provincia = 'La provincia es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) onNext()
  }

  const handleChange = (field: keyof CheckoutData, value: any) => {
    onChange({ [field]: value })
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }))
  }

  const handleShippingTypeChange = (value: string) => {
    onChange({
      tipoEntrega: value as CheckoutData['tipoEntrega'],
      ...(value === 'RETIRO_LOCAL' && { direccion: '', ciudad: '', provincia: '', codigoPostal: '', sucursalCorreo: '', sucursalId: '', sucursalNombre: '' }),
      ...(value !== 'SUCURSAL_CORREO' && { sucursalCorreo: '', sucursalId: '', sucursalNombre: '' }),
      ...(value === 'ENVIO_DOMICILIO' && { carrier: data.carrier ?? 'CORREO_ARGENTINO' }),
    })
    setErrors({})
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#4A5D45] flex items-center gap-2">
          <Truck className="w-4 h-4" /> Modalidad de Entrega
        </Label>

        <RadioGroup
          value={data.tipoEntrega}
          onValueChange={handleShippingTypeChange}
          className="grid grid-cols-1 gap-4"
        >
          {/* 1. Retiro Local */}
          <label className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${data.tipoEntrega === 'RETIRO_LOCAL' ? 'border-[#4A5D45] bg-[#F9F9F7] shadow-md' : 'border-[#E9E9E0] bg-white hover:border-[#D6D6C2]'}`}>
            <RadioGroupItem value="RETIRO_LOCAL" id="retiro" className="mt-1 border-[#A3B18A] text-[#4A5D45]" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#3A4031] uppercase text-xs tracking-wider">Retiro por Caseros</span>
                <span className="text-[10px] font-bold text-[#A3B18A] uppercase">Sin Cargo</span>
              </div>
              <p className="text-[11px] text-[#5B6350]">Retirá tu pedido directamente en nuestras oficinas coordinando previamente la entrega.</p>
              <div className="mt-2 flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-[#A3B18A]">
                <span className="flex items-center gap-1"><Store className="w-3 h-3" /> Punto Pick-up</span>
              </div>
            </div>
          </label>

          {/* 2. Moto Mensajería */}
          <label className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${data.tipoEntrega === 'MOTOMENSAJERIA' ? 'border-[#4A5D45] bg-[#F9F9F7] shadow-md' : 'border-[#E9E9E0] bg-white hover:border-[#D6D6C2]'}`}>
            <RadioGroupItem value="MOTOMENSAJERIA" id="moto" className="mt-1 border-[#A3B18A] text-[#4A5D45]" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#3A4031] uppercase text-xs tracking-wider">Motomensajería Rápida</span>
                <span className="text-[10px] font-bold text-[#4A5D45] uppercase">A Coordinar</span>
              </div>
              <p className="text-[11px] text-[#5B6350]">Ideal para CABA y GBA. El costo se abona al repartidor.</p>
              <div className="mt-2 flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-[#A3B18A]">
                <span className="flex items-center gap-1"><Bike className="w-3 h-3" /> Envío Express</span>
              </div>
            </div>
          </label>

          {/* 3. Envío a domicilio (Correo) */}
          <label className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${data.tipoEntrega === 'ENVIO_DOMICILIO' ? 'border-[#4A5D45] bg-[#F9F9F7] shadow-md' : 'border-[#E9E9E0] bg-white hover:border-[#D6D6C2]'}`}>
            <RadioGroupItem value="ENVIO_DOMICILIO" id="envio" className="mt-1 border-[#A3B18A] text-[#4A5D45]" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#3A4031] uppercase text-xs tracking-wider">Envío a Domicilio</span>
                <span className="text-[10px] font-bold text-[#4A5D45] uppercase">$9.500</span>
              </div>
              <p className="text-[11px] text-[#5B6350]">Recibí tus productos mediante Correo Argentino o Andreani.</p>
            </div>
          </label>

          {/* 4. Sucursal Correo */}
          <label className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${data.tipoEntrega === 'SUCURSAL_CORREO' ? 'border-[#4A5D45] bg-[#F9F9F7] shadow-md' : 'border-[#E9E9E0] bg-white hover:border-[#D6D6C2]'}`}>
            <RadioGroupItem value="SUCURSAL_CORREO" id="sucursal" className="mt-1 border-[#A3B18A] text-[#4A5D45]" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#3A4031] uppercase text-xs tracking-wider">Punto de Retiro (Correo)</span>
                <span className="text-[10px] font-bold text-[#4A5D45] uppercase">$7.000</span>
              </div>
              <p className="text-[11px] text-[#5B6350]">Retirá en la sucursal de correo más cercana a tu zona.</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Selector de Carrier */}
      {(data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'SUCURSAL_CORREO') && (
        <div className="space-y-4 pt-4 border-t border-[#F5F5F0]">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-[#5B6350]">Empresa de Transporte</Label>
          <div className="grid grid-cols-2 gap-4">
            {CARRIERS.map(c => (
              <button
                key={c.value}
                onClick={() => handleChange('carrier', c.value)}
                className={`px-4 py-3 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wider transition-all ${data.carrier === c.value ? 'border-[#A3B18A] bg-[#A3B18A] text-white shadow-sm' : 'border-[#E9E9E0] text-[#5B6350] hover:border-[#A3B18A]'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de Dirección (Para domicilio y Moto) */}
      {(data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'MOTOMENSAJERIA') && (
        <div className="space-y-6 pt-6 border-t border-[#F5F5F0]">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#4A5D45]">Dirección de Destino</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-[#5B6350] font-bold uppercase tracking-tighter">Calle y Número *</Label>
              <Input
                value={data.direccion || ''}
                onChange={e => handleChange('direccion', e.target.value)}
                className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.direccion ? 'border-red-400' : ''}`}
                placeholder="Ej: Av. Santa Fe 1234, 5to B"
              />
              {errors.direccion && <p className="text-[10px] text-red-500 font-bold italic">{errors.direccion}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-[#5B6350] font-bold uppercase tracking-tighter">ciudad / barrio *</Label>
                <Input
                  value={data.ciudad || ''}
                  onChange={e => handleChange('ciudad', e.target.value)}
                  placeholder="Ej: Caseros"
                  className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.ciudad ? 'border-red-400' : ''}`}
                />
                {errors.ciudad && <p className="text-[10px] text-red-500 font-bold italic">{errors.ciudad}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#5B6350] font-bold uppercase tracking-tighter">Localidad / Partido *</Label>
                <Input
                  value={data.ciudad || ''}
                  onChange={e => handleChange('ciudad', e.target.value)}
                  placeholder="Ej: Tres de Febrero"
                  className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.ciudad ? 'border-red-400' : ''}`}
                />
                {errors.ciudad && <p className="text-[10px] text-red-500 font-bold italic">{errors.ciudad}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-[#5B6350] font-bold uppercase tracking-tighter">Provincia *</Label>
                <Input
                  value={data.provincia || ''}
                  onChange={e => handleChange('provincia', e.target.value)}
                  placeholder="Ej: Buenos Aires"
                  className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.provincia ? 'border-red-400' : ''}`}
                />
                {errors.provincia && <p className="text-[10px] text-red-500 font-bold italic">{errors.provincia}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#5B6350] font-bold uppercase tracking-tighter">C. Postal *</Label>
                <Input
                  value={data.codigoPostal || ''}
                  onChange={e => handleChange('codigoPostal', e.target.value)}
                  maxLength={4}
                  placeholder="1678"
                  className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.codigoPostal ? 'border-red-400' : ''}`}
                />
                {errors.codigoPostal && <p className="text-[10px] text-red-500 font-bold italic">{errors.codigoPostal}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sucursal Correo (Input de texto y campos geográficos) */}
      {data.tipoEntrega === 'SUCURSAL_CORREO' && (
        <div className="space-y-6 pt-6 border-t border-[#F5F5F0]">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#4A5D45]">Detalle de Sucursal</h3>

          <div className="space-y-2">
            <Label className="text-xs text-[#5B6350] font-bold uppercase tracking-tighter">Sucursal de Retiro *</Label>
            <Input
              value={data.sucursalCorreo || ''}
              onChange={e => handleChange('sucursalCorreo', e.target.value)}
              className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.sucursalCorreo ? 'border-red-400' : ''}`}
              placeholder="Ej: Sucursal Caballito (Correo Argentino)"
            />
            {errors.sucursalCorreo && <p className="text-[10px] text-red-500 font-bold italic">{errors.sucursalCorreo}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-[#5B6350] font-bold uppercase tracking-tighter">ciudad de la sucursal *</Label>
              <Input
                value={data.ciudad || ''}
                onChange={e => handleChange('ciudad', e.target.value)}
                placeholder="Ej: Caballito"
                className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.ciudad ? 'border-red-400' : ''}`}
              />
              {errors.ciudad && <p className="text-[10px] text-red-500 font-bold italic">{errors.ciudad}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-[#5B6350] font-bold uppercase tracking-tighter">Provincia *</Label>
              <Input
                value={data.provincia || ''}
                onChange={e => handleChange('provincia', e.target.value)}
                placeholder="Ej: CABA"
                className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.provincia ? 'border-red-400' : ''}`}
              />
              {errors.provincia && <p className="text-[10px] text-red-500 font-bold italic">{errors.provincia}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button type="button" variant="ghost" onClick={onBack} className="text-[#A3B18A] hover:text-[#4A5D45] text-[10px] font-bold uppercase tracking-widest">
          ← Volver
        </Button>
        <Button onClick={handleSubmit} className="flex-1 bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-2xl h-14 font-bold uppercase tracking-[0.15em] text-xs shadow-lg">
          Continuar al Pago <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}