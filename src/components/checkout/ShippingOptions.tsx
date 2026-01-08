'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckoutData } from '@/app/checkout/page'
import { Truck, MapPin, Clock, DollarSign, Bike } from 'lucide-react'

interface ShippingOptionsProps {
  data: CheckoutData
  onChange: (data: Partial<CheckoutData>) => void
  onNext: () => void
  onBack: () => void
}

export default function ShippingOptions({
  data,
  onChange,
  onNext,
  onBack,
}: ShippingOptionsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Dirección obligatoria para envío a domicilio y moto
    if (
      data.tipoEntrega === 'ENVIO_DOMICILIO' ||
      data.tipoEntrega === 'MOTOMENSAJERIA'
    ) {
      if (!data.direccion?.trim()) {
        newErrors.direccion = 'La dirección es requerida'
      }

      if (!data.ciudad?.trim()) {
        newErrors.ciudad = 'La ciudad es requerida'
      }

      if (!data.provincia?.trim()) {
        newErrors.provincia = 'La provincia es requerida'
      }

      if (!data.codigoPostal?.trim()) {
        newErrors.codigoPostal = 'El código postal es requerido'
      } else if (!/^\d{4}$/.test(data.codigoPostal)) {
        newErrors.codigoPostal = 'El código postal debe tener 4 dígitos'
      }
    }

    // Sucursal obligatoria para sucursal de Correo
    if (data.tipoEntrega === 'SUCURSAL_CORREO') {
      if (!data.sucursalCorreo?.trim()) {
        newErrors.sucursalCorreo =
          'La sucursal de Correo Argentino es requerida'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const handleChange = (field: keyof CheckoutData, value: string) => {
    onChange({ [field]: value })

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleShippingTypeChange = (value: string) => {
    onChange({
      tipoEntrega: value as CheckoutData['tipoEntrega'],
      ...(value === 'RETIRO_LOCAL' && {
        direccion: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
        sucursalCorreo: '',
      }),
      ...(value === 'SUCURSAL_CORREO' && {
        sucursalCorreo: '',
      }),
    })

    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Opciones de entrega */}
      <div>
        <Label className="text-base font-medium mb-4 block">
          ¿Cómo preferís recibir tu pedido?
        </Label>

        <RadioGroup
          value={data.tipoEntrega}
          onValueChange={handleShippingTypeChange}
          className="space-y-4"
        >
          {/* Retiro en local */}
          <Card
            className={`cursor-pointer transition-all ${data.tipoEntrega === 'RETIRO_LOCAL'
                ? 'ring-2 ring-rose-500 border-rose-500'
                : 'hover:border-gray-400'
              }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="RETIRO_LOCAL" id="retiro" />
                <Label htmlFor="retiro" className="flex-1 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-rose-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Retiro en local
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Retirá tu pedido en nuestro local sin costo adicional
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        📍 Dirección del local se confirma por WhatsApp o email
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-3 w-3" />
                          Gratis
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-3 w-3" />
                          Coordinamos horario de retiro
                        </span>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Envío a domicilio */}
          <Card
            className={`cursor-pointer transition-all ${data.tipoEntrega === 'ENVIO_DOMICILIO'
                ? 'ring-2 ring-rose-500 border-rose-500'
                : 'hover:border-gray-400'
              }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="ENVIO_DOMICILIO" id="envio" />
                <Label htmlFor="envio" className="flex-1 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-rose-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Envío a domicilio (Correo Argentino)
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Recibí tu pedido en la dirección que nos indiques
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        🚚 Envío por Correo Argentino a tu domicilio
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-amber-600">
                          <DollarSign className="h-3 w-3" />
                          $9.500 (Gratis desde $200.000)
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-3 w-3" />
                          3–7 días hábiles aprox.
                        </span>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Retiro en sucursal de Correo Argentino */}
          <Card
            className={`cursor-pointer transition-all ${data.tipoEntrega === 'SUCURSAL_CORREO'
                ? 'ring-2 ring-rose-500 border-rose-500'
                : 'hover:border-gray-400'
              }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="SUCURSAL_CORREO" id="sucursal-correo" />
                <Label
                  htmlFor="sucursal-correo"
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-rose-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Retiro en sucursal de Correo Argentino
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Te enviamos el paquete a la sucursal que elijas y lo
                        retirás cuando puedas
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        📮 Ideal si no hay nadie en tu domicilio durante el día
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-amber-600">
                          <DollarSign className="h-3 w-3" />
                          $7.000 (Gratis desde $200.000)
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-3 w-3" />
                          3–7 días hábiles aprox.
                        </span>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Moto mensajería */}
          <Card
            className={`cursor-pointer transition-all ${data.tipoEntrega === 'MOTOMENSAJERIA'
                ? 'ring-2 ring-rose-500 border-rose-500'
                : 'hover:border-gray-400'
              }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="MOTOMENSAJERIA" id="moto" />
                <Label htmlFor="moto" className="flex-1 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Bike className="h-5 w-5 text-rose-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Moto mensajería (a coordinar)
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Envío rápido por moto en zonas habilitadas. El costo se
                        coordina luego por WhatsApp.
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        💬 Te confirmamos valor y rango horario según zona
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-amber-600">
                          <DollarSign className="h-3 w-3" />
                          Se abona aparte al repartidor
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-3 w-3" />
                          Envío rápido (a coordinar)
                        </span>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      {/* Formulario de dirección (domicilio y moto) */}
      {(data.tipoEntrega === 'ENVIO_DOMICILIO' ||
        data.tipoEntrega === 'MOTOMENSAJERIA') && (
          <>
            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">
                Dirección de entrega
              </h3>

              <div className="space-y-2">
                <Label htmlFor="direccion">
                  Dirección completa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="direccion"
                  type="text"
                  value={data.direccion || ''}
                  onChange={e => handleChange('direccion', e.target.value)}
                  placeholder="Ej: Av. Corrientes 1234, Piso 5, Dto. B"
                  className={errors.direccion ? 'border-red-500' : ''}
                />
                {errors.direccion && (
                  <p className="text-sm text-red-500">{errors.direccion}</p>
                )}
                <p className="text-sm text-gray-500">
                  Incluí calle, número, piso, departamento, etc.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">
                    Ciudad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ciudad"
                    type="text"
                    value={data.ciudad || ''}
                    onChange={e => handleChange('ciudad', e.target.value)}
                    placeholder="Ej: Buenos Aires"
                    className={errors.ciudad ? 'border-red-500' : ''}
                  />
                  {errors.ciudad && (
                    <p className="text-sm text-red-500">{errors.ciudad}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoPostal">
                    Código Postal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="codigoPostal"
                    type="text"
                    value={data.codigoPostal || ''}
                    onChange={e => handleChange('codigoPostal', e.target.value)}
                    placeholder="1234"
                    maxLength={4}
                    className={errors.codigoPostal ? 'border-red-500' : ''}
                  />
                  {errors.codigoPostal && (
                    <p className="text-sm text-red-500">
                      {errors.codigoPostal}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia">
                  Provincia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="provincia"
                  type="text"
                  value={data.provincia || ''}
                  onChange={e => handleChange('provincia', e.target.value)}
                  placeholder="Ej: Buenos Aires"
                  className={errors.provincia ? 'border-red-500' : ''}
                />
                {errors.provincia && (
                  <p className="text-sm text-red-500">{errors.provincia}</p>
                )}
              </div>

              {data.tipoEntrega === 'ENVIO_DOMICILIO' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">
                    📦 Información de envío a domicilio
                  </h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Envío por Correo Argentino a tu domicilio</li>
                    <li>• Tiempo estimado: 3 a 7 días hábiles</li>
                    <li>
                      • Envío gratis en compras mayores a $200.000 (solo correo)
                    </li>
                  </ul>
                </div>
              )}

              {data.tipoEntrega === 'MOTOMENSAJERIA' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    🏍 Información sobre moto mensajería
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• El costo se coordina luego según zona</li>
                    <li>• El envío se abona aparte al repartidor</li>
                    <li>• Ideal para entregas rápidas en CABA / zonas cercanas</li>
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

      {/* Formulario de sucursal (solo sucursal Correo) */}
      {data.tipoEntrega === 'SUCURSAL_CORREO' && (
        <>
          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Sucursal de Correo Argentino
            </h3>

            <div className="space-y-2">
              <Label htmlFor="sucursalCorreo">
                Sucursal donde querés retirar{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sucursalCorreo"
                type="text"
                value={data.sucursalCorreo || ''}
                onChange={e => handleChange('sucursalCorreo', e.target.value)}
                placeholder="Ej: Sucursal Caseros - Av. Mitre 1234"
                className={errors.sucursalCorreo ? 'border-red-500' : ''}
              />
              {errors.sucursalCorreo && (
                <p className="text-sm text-red-500">
                  {errors.sucursalCorreo}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Podés indicar la sucursal exacta o una de referencia y luego
                coordinamos por mail.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                📮 Información sobre retiro en sucursal
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Te avisamos por email cuando el pedido llega a la sucursal</li>
                <li>• Necesitás llevar tu DNI para retirar</li>
                <li>• Envío gratis en compras mayores a $200.000</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Info retiro local */}
      {data.tipoEntrega === 'RETIRO_LOCAL' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">
            🏪 Información de retiro
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Te confirmamos la dirección exacta por WhatsApp o email</li>
            <li>• Coordinamos horarios flexibles para tu comodidad</li>
            <li>• Retiro sin costo adicional</li>
          </ul>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Volver a datos personales
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-rose-600 hover:bg-rose-700"
        >
          Continuar al pago
        </Button>
      </div>
    </div>
  )
}
