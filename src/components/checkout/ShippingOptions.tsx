// src/components/checkout/ShippingOptions.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { CheckoutData } from '@/app/checkout/page'
import { Truck, MapPin, Clock, DollarSign, Bike } from 'lucide-react'

interface ShippingOptionsProps {
  data: CheckoutData
  onChange: (data: Partial<CheckoutData>) => void
  onNext: () => void
  onBack: () => void
}

export default function ShippingOptions({ data, onChange, onNext, onBack }: ShippingOptionsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Dirección obligatoria para envío a domicilio y moto
    if (data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'MOTOMENSAJERIA') {
      if (!data.direccion?.trim()) newErrors.direccion = 'La dirección es requerida'
      if (!data.ciudad?.trim()) newErrors.ciudad = 'La ciudad es requerida'
      if (!data.provincia?.trim()) newErrors.provincia = 'La provincia es requerida'

      if (!data.codigoPostal?.trim()) newErrors.codigoPostal = 'El código postal es requerido'
      else if (!/^\d{4}$/.test(data.codigoPostal)) newErrors.codigoPostal = 'El código postal debe tener 4 dígitos'
    }

    // Sucursal obligatoria para sucursal
    if (data.tipoEntrega === 'SUCURSAL_CORREO') {
      if (!data.sucursalId?.trim() && !data.sucursalCorreo?.trim()) {
        newErrors.sucursalCorreo = 'La sucursal es requerida'
      }
    }

    // Carrier obligatorio cuando hay envío por correo (domicilio o sucursal)
    if (data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'SUCURSAL_CORREO') {
      if (!data.carrier) newErrors.carrier = 'Elegí un correo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) onNext()
  }

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleChange = (field: keyof CheckoutData, value: any) => {
    onChange({ [field]: value })
    clearError(field as string)
  }

  const handleShippingTypeChange = (value: string) => {
    onChange({
      tipoEntrega: value as CheckoutData['tipoEntrega'],
      ...(value === 'RETIRO_LOCAL' && {
        direccion: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
        carrier: 'CORREO_ARGENTINO',
        sucursalId: '',
        sucursalNombre: '',
        sucursalCorreo: '',
      }),
      ...(value === 'ENVIO_DOMICILIO' && {
        carrier: data.carrier ?? 'CORREO_ARGENTINO',
        sucursalId: '',
        sucursalNombre: '',
        sucursalCorreo: '',
      }),
      ...(value === 'SUCURSAL_CORREO' && {
        carrier: data.carrier ?? 'CORREO_ARGENTINO',
        sucursalId: '',
        sucursalNombre: '',
        sucursalCorreo: '',
      }),
    })
    setErrors({})
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-4 block">¿Cómo preferís recibir tu pedido?</Label>

        <RadioGroup value={data.tipoEntrega} onValueChange={handleShippingTypeChange} className="space-y-4">
          {/* ... tus Cards (retiro/envío/sucursal/moto) iguales ... */}
        </RadioGroup>
      </div>

      {/* Carrier dropdown para ENVIO_DOMICILIO */}
      {data.tipoEntrega === 'ENVIO_DOMICILIO' && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label>Empresa de envío <span className="text-red-500">*</span></Label>
            <select
              className={`w-full border rounded-md px-3 py-2 text-sm ${errors.carrier ? 'border-red-500' : ''}`}
              value={data.carrier || 'CORREO_ARGENTINO'}
              onChange={(e) => handleChange('carrier', e.target.value as any)}
            >
              <option value="CORREO_ARGENTINO">Correo Argentino</option>
              <option value="ANDREANI">Andreani</option>
            </select>
            {errors.carrier && <p className="text-sm text-red-500">{errors.carrier}</p>}
          </div>
        </>
      )}

      {/* Dirección (domicilio o moto) */}
      {(data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'MOTOMENSAJERIA') && (
        <>
          <Separator />
          {/* ... tu form de dirección tal cual ... */}
        </>
      )}

      {/* Sucursal (para SUCURSAL_CORREO) */}
      {data.tipoEntrega === 'SUCURSAL_CORREO' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Retiro en sucursal</h3>

            <div className="space-y-2">
              <Label>Correo</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={data.carrier || 'CORREO_ARGENTINO'}
                onChange={(e) =>
                  onChange({
                    carrier: e.target.value as any,
                    sucursalId: '',
                    sucursalNombre: '',
                    sucursalCorreo: '',
                  })
                }
              >
                <option value="CORREO_ARGENTINO">Correo Argentino</option>
                <option value="ANDREANI">Andreani</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Sucursal <span className="text-red-500">*</span></Label>
              {/* por ahora mock; luego lo llenamos con API real */}
              <select
                className={`w-full border rounded-md px-3 py-2 text-sm ${errors.sucursalCorreo ? 'border-red-500' : ''}`}
                value={data.sucursalId || ''}
                onChange={(e) => {
                  const id = e.target.value
                  const nombre = e.target.selectedOptions?.[0]?.textContent || ''
                  onChange({ sucursalId: id, sucursalNombre: nombre, sucursalCorreo: nombre })
                  clearError('sucursalCorreo')
                }}
              >
                <option value="">Elegí una sucursal</option>
                {(data.carrier === 'ANDREANI'
                  ? [
                    { id: 'AND-001', nombre: 'Andreani - Sucursal Palermo' },
                    { id: 'AND-002', nombre: 'Andreani - Sucursal San Martín' },
                  ]
                  : [
                    { id: 'CA-001', nombre: 'Correo Argentino - Sucursal Caseros' },
                    { id: 'CA-002', nombre: 'Correo Argentino - Sucursal Caballito' },
                  ]
                ).map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
              {errors.sucursalCorreo && <p className="text-sm text-red-500">{errors.sucursalCorreo}</p>}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Volver a datos personales</Button>
        <Button type="button" onClick={handleSubmit} className="bg-rose-600 hover:bg-rose-700">
          Continuar al pago
        </Button>
      </div>
    </div>
  )
}
