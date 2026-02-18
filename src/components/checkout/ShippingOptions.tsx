'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckoutData } from '@/app/checkout/page'
import { Truck, Bike, ChevronRight, Store, Loader2, MapPin, ExternalLink, AlertCircle, Search } from 'lucide-react'
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

  // ✅ Auto-scroll al inicio al cargar la sección
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
        <div className="space-y-5 pt-4 border-t text-left">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">Ubicación para Retiro</Label>
            {currentCarrierLink && (
              <a href={currentCarrierLink} target="_blank" className="text-[12px] text-[#A3B18A] flex items-center gap-1 hover:underline font-bold uppercase leading-tight">
                <ExternalLink className="w-3 h-3" /> Ver mapa oficial de sucursales
              </a>
            )}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input value={data.provincia || ''} onChange={e => onChange({ provincia: e.target.value })} placeholder="Provincia" className="bg-[#F9F9F7] rounded-xl h-11" />
              <Input value={data.localidad || ''} onChange={e => onChange({ localidad: e.target.value })} placeholder="Localidad" className="bg-[#F9F9F7] rounded-xl h-11" />
            </div>

            <Button
              type="button"
              onClick={buscarSucursales}
              disabled={loadingSucursales}
              className="w-full bg-[#A3B18A] hover:bg-[#8fa172] text-white rounded-xl h-11 uppercase text-[10px] font-bold tracking-widest transition-all"
            >
              {loadingSucursales ? (
                <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Buscando...</>
              ) : (
                <><Search className="h-4 w-4 mr-2" /> Buscar Sucursales Disponibles</>
              )}
            </Button>
          </div>

          {/* Mostrar lista si hay resultados */}
          {listaSucursales.length > 0 && (
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto mt-4 p-1">
              <p className="text-[10px] uppercase font-bold text-[#A3B18A] mb-1">Resultados encontrados:</p>
              {listaSucursales.map(s => (
                <button key={s.id} type="button" onClick={() => onChange({ sucursalId: s.id, sucursalNombre: s.nombre, sucursalCorreo: `${s.nombre} - ${s.direccion}` })}
                  className={`p-4 text-left rounded-2xl border-2 transition-all ${data.sucursalId === s.id ? 'border-[#4A5D45] bg-[#F9F9F7]' : 'border-[#F5F5F0] hover:border-[#E9E9E0]'}`}>
                  <div className="font-bold text-[#3A4031] text-xs uppercase">{s.nombre}</div>
                  <div className="text-[11px] text-[#5B6350] mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {s.direccion}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* MODO MANUAL */}
          {busquedaIntentada && listaSucursales.length === 0 && !loadingSucursales && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-[10px] text-amber-800 leading-relaxed">
                  <p className="font-bold uppercase mb-1 text-amber-900">Carga Manual de Sucursal</p>
                  <p className="mb-2">No encontramos resultados automáticos para esa zona.</p>

                  {/* LA NOTA NUEVA */}
                  <div className="bg-white/50 p-2 rounded-lg border border-amber-200/50 space-y-1">
                    <p className="font-semibold italic">📍 Indicaciones importantes:</p>
                    <ul className="list-disc ml-3 space-y-1">
                      <li>Ingresá al <b>"Mapa oficial"</b> que te dejamos arriba.</li>
                      <li>Copiá el <b>nombre exacto</b> que le da el correo (Ej: Sucursal "Morón").</li>
                      <li>Agregá la <b>dirección completa</b>.</li>
                    </ul>
                    <p className="mt-2 text-[9px] font-bold text-amber-700 uppercase">
                      ⚠️ Ser específicos evita demoras e inconvenientes en el envío.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] text-[#5B6350] uppercase font-bold">Nombre y Dirección de la Sucursal</Label>
                <Input
                  value={data.sucursalCorreo || ''}
                  onChange={e => onChange({ sucursalCorreo: e.target.value, sucursalId: '', sucursalNombre: e.target.value })}
                  placeholder="Ej: Correo Argentino Sucursal Caseros - Av. San Martín 1500"
                  className="bg-white border-[#A3B18A] rounded-xl h-12 text-xs"
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
        <Button onClick={() => validateForm() && onNext()} className="flex-1 bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-2xl h-14 font-bold uppercase text-xs tracking-widest shadow-lg transition-transform active:scale-[0.98]">
          Continuar al Pago <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}