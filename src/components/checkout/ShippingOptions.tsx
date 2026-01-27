'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckoutData } from '@/app/checkout/page'
import { Truck, Bike, ChevronRight, Store, Loader2, MapPin, ExternalLink, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ShippingOptionsProps {
  data: CheckoutData
  onChange: (data: Partial<CheckoutData>) => void
  onNext: () => void
  onBack: () => void
}

const CARRIERS = [
  {
    value: 'CORREO_ARGENTINO',
    label: 'Correo Argentino',
    link: 'https://www.correoargentino.com.ar/formularios/sucursales'
  },
  {
    value: 'ANDREANI',
    label: 'Andreani',
    link: 'https://www.andreani.com/buscar-sucursal'
  },
] as const

export default function ShippingOptions({ data, onChange, onNext, onBack }: ShippingOptionsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingSucursales, setLoadingSucursales] = useState(false)
  const [busquedaIntentada, setBusquedaIntentada] = useState(false)
  const [listaSucursales, setListaSucursales] = useState<any[]>([])

  const buscarSucursales = async () => {
    if (!data.provincia?.trim() || !data.localidad?.trim() || !data.carrier) {
      toast.error("Completá Correo, Provincia y Localidad")
      return
    }
    setLoadingSucursales(true)
    setBusquedaIntentada(true)
    setListaSucursales([])
    try {
      const res = await fetch(`/api/shipping/sucursales?carrier=${data.carrier}&provincia=${encodeURIComponent(data.provincia)}&localidad=${encodeURIComponent(data.localidad)}`)
      const json = await res.json()
      if (json.sucursales?.length > 0) {
        setListaSucursales(json.sucursales)
      } else {
        toast.info("No se encontraron sucursales automáticas. Por favor, ingresala manualmente.")
      }
    } catch (e) {
      console.error("Error buscando sucursales:", e)
      toast.error("Error de conexión. Podés usar la carga manual.")
    } finally {
      setLoadingSucursales(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'MOTOMENSAJERIA') {
      if (!data.direccion?.trim()) newErrors.direccion = 'Requerido'
      if (!data.localidad?.trim()) newErrors.localidad = 'Requerido'
      if (!data.provincia?.trim()) newErrors.provincia = 'Requerido'
      if (!data.codigoPostal?.trim()) newErrors.codigoPostal = 'Requerido'
    }
    if (data.tipoEntrega === 'SUCURSAL_CORREO') {
      if (!data.sucursalId && !data.sucursalCorreo?.trim()) {
        newErrors.sucursalCorreo = 'Debés seleccionar o indicar una sucursal'
      }
      if (!data.provincia?.trim()) newErrors.provincia = 'Requerido'
      if (!data.localidad?.trim()) newErrors.localidad = 'Requerido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCarrierChange = (c: string) => {
    onChange({ carrier: c as any, sucursalId: '', sucursalNombre: '', sucursalCorreo: '' })
    setListaSucursales([])
    setBusquedaIntentada(false)
  }

  const handleShippingTypeChange = (v: string) => {
    const value = v as CheckoutData['tipoEntrega'];
    onChange({
      tipoEntrega: value,
      // Al cambiar tipo, reseteamos datos específicos de sucursal pero MANTENEMOS provincia y localidad
      sucursalId: '',
      sucursalNombre: '',
      sucursalCorreo: '',
      ...(value === 'RETIRO_LOCAL' && { direccion: '', ciudad: '', localidad: '', provincia: '', codigoPostal: '' }),
    });
    setListaSucursales([]);
    setBusquedaIntentada(false);
  }

  const currentCarrierLink = CARRIERS.find(c => c.value === data.carrier)?.link

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4 text-left">
        <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#4A5D45]">Modalidad de Entrega</Label>
        <RadioGroup value={data.tipoEntrega} onValueChange={handleShippingTypeChange} className="grid grid-cols-1 gap-4">

          <label className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${data.tipoEntrega === 'RETIRO_LOCAL' ? 'border-[#4A5D45] bg-[#F9F9F7]' : 'border-[#E9E9E0] bg-white'}`}>
            <RadioGroupItem value="RETIRO_LOCAL" />
            <div className="flex-1 text-left">
              <span className="font-bold text-[#3A4031] uppercase text-xs">Retiro por Caseros</span>
              <p className="text-[11px] text-[#5B6350]">Retirá en nuestras oficinas (Sin cargo).</p>
            </div>
          </label>

          <label className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${data.tipoEntrega === 'MOTOMENSAJERIA' ? 'border-[#4A5D45] bg-[#F9F9F7]' : 'border-[#E9E9E0] bg-white'}`}>
            <RadioGroupItem value="MOTOMENSAJERIA" />
            <div className="flex-1 text-left">
              <span className="font-bold text-[#3A4031] uppercase text-xs">Motomensajería Rápida</span>
              <p className="text-[11px] text-[#5B6350]">CABA y GBA. Costo a coordinar.</p>
            </div>
          </label>

          <label className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${data.tipoEntrega === 'ENVIO_DOMICILIO' ? 'border-[#4A5D45] bg-[#F9F9F7]' : 'border-[#E9E9E0] bg-white'}`}>
            <RadioGroupItem value="ENVIO_DOMICILIO" />
            <div className="flex-1 text-left">
              <span className="font-bold text-[#3A4031] uppercase text-xs">Envío a Domicilio</span>
              <p className="text-[11px] text-[#5B6350]">Correo Argentino o Andreani.</p>
            </div>
          </label>

          <label className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${data.tipoEntrega === 'SUCURSAL_CORREO' ? 'border-[#4A5D45] bg-[#F9F9F7]' : 'border-[#E9E9E0] bg-white'}`}>
            <RadioGroupItem value="SUCURSAL_CORREO" />
            <div className="flex-1 text-left">
              <span className="font-bold text-[#3A4031] uppercase text-xs">Punto de Retiro (Correo)</span>
              <p className="text-[11px] text-[#5B6350]">Retirá en sucursal oficial.</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {(data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'SUCURSAL_CORREO') && (
        <div className="space-y-4 pt-4 border-t text-left">
          <Label className="text-[10px] uppercase font-bold text-[#5B6350]">Empresa de Transporte</Label>
          <div className="grid grid-cols-2 gap-4">
            {CARRIERS.map(c => (
              <button key={c.value} type="button" onClick={() => handleCarrierChange(c.value)}
                className={`px-4 py-3 rounded-xl border-2 text-[11px] font-bold uppercase ${data.carrier === c.value ? 'border-[#A3B18A] bg-[#A3B18A] text-white' : 'border-[#E9E9E0]'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(data.tipoEntrega === 'ENVIO_DOMICILIO' || data.tipoEntrega === 'MOTOMENSAJERIA') && (
        <div className="space-y-4 pt-4 border-t text-left">
          <Label className="text-xs font-bold uppercase">Dirección de Envío</Label>
          <Input value={data.direccion || ''} onChange={e => onChange({ direccion: e.target.value })} placeholder="Calle y Número" className="bg-[#F9F9F7] rounded-xl h-11" />
          <div className="grid grid-cols-2 gap-4">
            <Input value={data.localidad || ''} onChange={e => onChange({ localidad: e.target.value })} placeholder="Localidad" className="bg-[#F9F9F7] rounded-xl h-11" />
            <Input value={data.provincia || ''} onChange={e => onChange({ provincia: e.target.value })} placeholder="Provincia" className="bg-[#F9F9F7] rounded-xl h-11" />
          </div>
          <Input value={data.codigoPostal || ''} onChange={e => onChange({ codigoPostal: e.target.value })} placeholder="Código Postal" maxLength={4} className="bg-[#F9F9F7] rounded-xl h-11 w-1/2" />
        </div>
      )}

      {data.tipoEntrega === 'SUCURSAL_CORREO' && (
        <div className="space-y-4 pt-4 border-t text-left">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold uppercase">Datos de la Sucursal</Label>
            {currentCarrierLink && (
              <a href={currentCarrierLink} target="_blank" className="text-[10px] text-[#A3B18A] flex items-center gap-1 hover:underline font-bold uppercase">
                <ExternalLink className="w-3 h-3" /> Buscá el nombre de tu sucursal en la página oficial del correo
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input value={data.provincia || ''} onChange={e => onChange({ provincia: e.target.value })} placeholder="Provincia" className="bg-[#F9F9F7] rounded-xl h-11" />
            <div className="flex gap-2">
              <Input value={data.localidad || ''} onChange={e => onChange({ localidad: e.target.value })} placeholder="Localidad" className="bg-[#F9F9F7] rounded-xl h-11 flex-1" />
              <Button type="button" onClick={buscarSucursales} disabled={loadingSucursales} className="bg-[#A3B18A] text-white rounded-xl h-11">
                {loadingSucursales ? <Loader2 className="animate-spin h-4 w-4" /> : "Buscar"}
              </Button>
            </div>
          </div>

          {/* Mostrar lista si hay resultados */}
          {listaSucursales.length > 0 && (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto mt-2">
              {listaSucursales.map(s => (
                <button key={s.id} type="button" onClick={() => onChange({ sucursalId: s.id, sucursalNombre: s.nombre, sucursalCorreo: `${s.nombre} - ${s.direccion}` })}
                  className={`p-3 text-left rounded-xl border-2 text-[11px] ${data.sucursalId === s.id ? 'border-[#4A5D45] bg-[#F9F9F7]' : 'border-gray-100'}`}>
                  <div className="font-bold">{s.nombre}</div>
                  <div className="text-gray-500">{s.direccion}</div>
                </button>
              ))}
            </div>
          )}

          {/* MODO MANUAL */}
          {busquedaIntentada && listaSucursales.length === 0 && !loadingSucursales && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-[10px] text-amber-800 leading-relaxed">
                  <p className="font-bold uppercase mb-1">Carga Manual de Sucursal</p>
                  No pudimos conectar con el servidor de correos. Podés ingresar el nombre de tu sucursal manualmente debajo. Por favor sé bien específico/a para evitar errores en la entrega.
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-gray-500 uppercase font-bold">Nombre de la Sucursal de Retiro</Label>
                <Input
                  value={data.sucursalCorreo || ''}
                  onChange={e => onChange({ sucursalCorreo: e.target.value, sucursalId: '', sucursalNombre: e.target.value })}
                  placeholder="Ej: Sucursal Caseros Centro"
                  className="bg-white border-[#A3B18A] rounded-xl h-11"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button variant="ghost" onClick={onBack} className="text-[#A3B18A] font-bold uppercase text-[10px] tracking-widest">
          ← Volver
        </Button>
        <Button onClick={() => validateForm() && onNext()} className="flex-1 bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-2xl h-14 font-bold uppercase text-xs tracking-widest shadow-lg">
          Continuar al Pago <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}