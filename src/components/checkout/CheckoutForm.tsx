'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckoutData } from '@/app/checkout/page'

interface CheckoutFormProps {
  data: CheckoutData
  onChange: (data: Partial<CheckoutData>) => void
  onNext: () => void
}

export default function CheckoutForm({ data, onChange, onNext }: CheckoutFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!data.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!data.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido'
    }

    if (!data.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!data.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^[\d\s\+\-\(\)]+$/.test(data.telefono)) {
      newErrors.telefono = 'El teléfono no es válido'
    }

    if (data.dni && !/^\d{7,8}$/.test(data.dni.replace(/\D/g, ''))) {
      newErrors.dni = 'El DNI debe tener 7 u 8 dígitos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext()
    }
  }

  const handleChange = (field: keyof CheckoutData, value: string) => {
    onChange({ [field]: value })
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            type="text"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ingresa tu nombre"
            className={errors.nombre ? 'border-red-500' : ''}
          />
          {errors.nombre && (
            <p className="text-sm text-red-500">{errors.nombre}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="apellido">
            Apellido <span className="text-red-500">*</span>
          </Label>
          <Input
            id="apellido"
            type="text"
            value={data.apellido}
            onChange={(e) => handleChange('apellido', e.target.value)}
            placeholder="Ingresa tu apellido"
            className={errors.apellido ? 'border-red-500' : ''}
          />
          {errors.apellido && (
            <p className="text-sm text-red-500">{errors.apellido}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="tu@email.com"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
        <p className="text-sm text-gray-500">
          Te enviaremos la confirmación del pedido a este email
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">
            Teléfono <span className="text-red-500">*</span>
          </Label>
          <Input
            id="telefono"
            type="tel"
            value={data.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            placeholder="+54 11 2233-4455"
            className={errors.telefono ? 'border-red-500' : ''}
          />
          {errors.telefono && (
            <p className="text-sm text-red-500">{errors.telefono}</p>
          )}
        </div>

        {/* DNI (opcional) */}
        <div className="space-y-2">
          <Label htmlFor="dni">
            DNI (opcional)
          </Label>
          <Input
            id="dni"
            type="text"
            value={data.dni || ''}
            onChange={(e) => handleChange('dni', e.target.value)}
            placeholder="12345678"
            maxLength={8}
            className={errors.dni ? 'border-red-500' : ''}
          />
          {errors.dni && (
            <p className="text-sm text-red-500">{errors.dni}</p>
          )}
          <p className="text-sm text-gray-500">
            Solo números, sin puntos ni espacios
          </p>
        </div>
      </div>

      {/* Notas adicionales */}
      <div className="space-y-2">
        <Label htmlFor="notas">
          Notas adicionales (opcional)
        </Label>
        <Textarea
          id="notas"
          value={data.notas || ''}
          onChange={(e) => handleChange('notas', e.target.value)}
          placeholder="¿Hay algo específico que deberíamos saber sobre tu pedido?"
          rows={3}
          maxLength={500}
        />
        <p className="text-sm text-gray-500">
          Máximo 500 caracteres
        </p>
      </div>

      {/* Información importante */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          📋 Información importante
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Verificá que todos los datos sean correctos</li>
          <li>• El email será usado para confirmar tu pedido</li>
          <li>• El teléfono nos permite coordinar la entrega</li>
          <li>• Todos los campos marcados con (*) son obligatorios</li>
        </ul>
      </div>

      {/* Botón continuar */}
      <div className="flex justify-end">
        <Button 
          type="submit"
          className="bg-rose-600 hover:bg-rose-700 px-8"
        >
          Continuar con la entrega
        </Button>
      </div>
    </form>
  )
}