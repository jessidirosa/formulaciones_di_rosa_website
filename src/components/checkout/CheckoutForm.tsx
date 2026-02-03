'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckoutData } from '@/app/checkout/page'
import { User, Mail, Phone, CreditCard, ClipboardList, Info } from 'lucide-react'

interface CheckoutFormProps {
  data: CheckoutData
  onChange: (data: Partial<CheckoutData>) => void
  onNext: () => void
}

export default function CheckoutForm({ data, onChange, onNext }: CheckoutFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!data.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!data.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
    if (!data.emailCliente.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailCliente)) {
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
    if (validateForm()) onNext()
  }

  const handleChange = (field: keyof CheckoutData, value: string) => {
    onChange({ [field]: value })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sección: Identificación del Paciente/Cliente */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F5F5F0]">
          <User className="w-4 h-4 text-[#A3B18A]" />
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#4A5D45]">Información Personal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-xs font-bold text-[#5B6350] uppercase tracking-wider">Nombre *</Label>
            <Input
              id="nombre"
              value={data.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: María"
              className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.nombre ? 'border-red-400' : ''}`}
            />
            {errors.nombre && <p className="text-[10px] text-red-500 font-bold italic">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido" className="text-xs font-bold text-[#5B6350] uppercase tracking-wider">Apellido *</Label>
            <Input
              id="apellido"
              value={data.apellido}
              onChange={(e) => handleChange('apellido', e.target.value)}
              placeholder="Ej: Di Rosa"
              className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.apellido ? 'border-red-400' : ''}`}
            />
            {errors.apellido && <p className="text-[10px] text-red-500 font-bold italic">{errors.apellido}</p>}
          </div>
        </div>
      </div>

      {/* Sección: Contacto y Facturación */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F5F5F0]">
          <Mail className="w-4 h-4 text-[#A3B18A]" />
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#4A5D45]">Contacto & Facturación</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold text-[#5B6350] uppercase tracking-wider">Email de Notificación *</Label>
          <Input
            id="email"
            type="email"
            value={data.emailCliente || ""}
            onChange={(e) => onChange({ emailCliente: e.target.value })}
            placeholder="tu@email.com"
            className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.email ? 'border-red-400' : ''}`}
            required
          />
          {errors.email && <p className="text-[10px] text-red-500 font-bold italic">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-xs font-bold text-[#5B6350] uppercase tracking-wider">Teléfono de contacto *</Label>
            <Input
              id="telefono"
              type="tel"
              value={data.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="+54 11 0000 0000"
              className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.telefono ? 'border-red-400' : ''}`}
            />
            {errors.telefono && <p className="text-[10px] text-red-500 font-bold italic">{errors.telefono}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni" className="text-xs font-bold text-[#5B6350] uppercase tracking-wider flex items-center gap-2">
              DNI * <span className="text-[10px] text-[#A3B18A] lowercase font-normal">(Para envíos por Andreani)</span>
            </Label>
            <Input
              id="dni"
              value={data.dni || ''}
              onChange={(e) => handleChange('dni', e.target.value)}
              placeholder="Solo números"
              maxLength={8}
              className={`bg-[#F9F9F7] border-[#E9E9E0] rounded-xl h-11 focus:ring-[#A3B18A] ${errors.dni ? 'border-red-400' : ''}`}
            />
            {errors.dni && <p className="text-[10px] text-red-500 font-bold italic">{errors.dni}</p>}
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notas" className="text-xs font-bold text-[#5B6350] uppercase tracking-wider flex items-center gap-2">
          <ClipboardList className="w-3.5 h-3.5" /> Notas sobre la formulación u orden
        </Label>
        <Textarea
          id="notas"
          value={data.notas || ''}
          onChange={(e) => handleChange('notas', e.target.value)}
          placeholder="¿Alguna aclaración sobre el envío o tu piel?"
          className="bg-[#F9F9F7] border-[#E9E9E0] rounded-2xl focus:ring-[#A3B18A] min-h-[100px]"
          maxLength={500}
        />
      </div>

      {/* Banner de Información - Estilo Laboratorio */}
      <div className="bg-[#E9E9E0]/50 border border-[#D6D6C2] rounded-2xl p-5">
        <div className="flex items-center gap-3 text-[#4A5D45] mb-3">
          <Info className="h-5 w-5" />
          <h4 className="font-bold text-xs uppercase tracking-widest">Protocolo de Verificación</h4>
        </div>
        <ul className="text-[11px] text-[#5B6350] space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-[#A3B18A] mt-1.5 flex-shrink-0" />
            Asegúrate de que el <strong>email</strong> sea correcto para recibir la confirmación de laboratorio.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-[#A3B18A] mt-1.5 flex-shrink-0" />
            El <strong>teléfono</strong> es vital para que el transporte coordine la entrega de tus productos.
          </li>
        </ul>
      </div>

      {/* Botón Continuar */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-[#4A5D45] hover:bg-[#3A4031] text-white px-10 h-14 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs shadow-lg shadow-emerald-900/10 transition-all active:scale-[0.98]"
        >
          Continuar al Método de Entrega
        </Button>
      </div>
    </form>
  )
}