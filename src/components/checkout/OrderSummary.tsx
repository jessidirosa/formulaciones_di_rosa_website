import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Truck, Info, MapPin, Bike, Store } from 'lucide-react'
import type { CartItem } from '@/contexts/CartContext'

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  costoEnvio: number
  descuento: number
  total: number
  tipoEntrega: string
}

export default function OrderSummary({
  items,
  subtotal,
  costoEnvio,
  descuento,
  total,
  tipoEntrega
}: OrderSummaryProps) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Mapeo de textos e íconos según tipo de entrega
  const getEntregaInfo = () => {
    switch (tipoEntrega) {
      case 'RETIRO_LOCAL':
        return { label: 'Retiro', icon: <Store className="w-3.5 h-3.5" />, note: 'Coordinaremos vía WhatsApp el horario de retiro en nuestras oficinas.' }
      case 'MOTOMENSAJERIA':
        return { label: 'Moto Mensajería', icon: <Bike className="w-3.5 h-3.5" />, note: 'Envío rápido a coordinar. El costo se abona al recibir el pedido.' }
      case 'SUCURSAL_CORREO':
        return { label: 'Retiro en Sucursal', icon: <MapPin className="w-3.5 h-3.5" />, note: 'El paquete será enviado a la sucursal de correo seleccionada.' }
      case 'ENVIO_DOMICILIO':
      default:
        return { label: 'Envío a Domicilio', icon: <Truck className="w-3.5 h-3.5" />, note: 'Los tiempos de entrega oscilan entre 10 y 15 días hábiles tras la preparación de la fórmula.' }
    }
  }

  const entrega = getEntregaInfo()

  return (
    <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-[#F9F9F7] border-b border-[#E9E9E0] py-4">
        <CardTitle className="flex items-center justify-between text-[#3A4031]">
          <span className="text-xs uppercase tracking-[0.2em] font-bold">Resumen de Orden</span>
          <Badge className="bg-[#4A5D45] text-[#F5F5F0] border-none text-[10px] font-bold px-2 py-0.5">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Lista de productos compacta */}
        <div className="space-y-4 max-h-[280px] overflow-y-auto no-scrollbar pr-1">
          {items.map((item) => (
            <div key={item.producto.id} className="flex gap-4 group">
              <div className="relative w-14 h-14 flex-shrink-0">
                <img
                  src={item.producto.imagen}
                  alt={item.producto.nombre}
                  className="w-full h-full object-cover rounded-xl bg-[#F5F5F0] border border-[#E9E9E0]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `https://placehold.co/100x100/F5F5F0/4A5D45?text=${encodeURIComponent(item.producto.nombre)}`
                  }}
                />
                <span className="absolute -top-2 -right-2 bg-[#A3B18A] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {item.cantidad}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-bold text-xs text-[#3A4031] line-clamp-1 uppercase tracking-tight">
                  {item.producto.nombre}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-bold text-[#A3B18A] uppercase tracking-widest">
                    {item.producto.categoria}
                  </span>
                  <span className="text-xs font-semibold text-[#5B6350]">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-[#F5F5F0]" />

        {/* Desglose de costos */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-medium text-[#5B6350]">
            <span>Subtotal de productos</span>
            <span className="text-[#3A4031]">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-xs font-medium text-[#5B6350]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#A3B18A]">{entrega.icon}</span>
              {entrega.label}
            </span>
            <div className="text-right">
              {tipoEntrega === 'MOTOMENSAJERIA' ? (
                <span className="text-[#4A5D45] font-bold uppercase text-[10px]">A Coordinar</span>
              ) : costoEnvio === 0 ? (
                <div>
                  <span className="text-[#4A5D45] font-bold uppercase text-[10px]">Sin Cargo</span>
                  {tipoEntrega === 'ENVIO_DOMICILIO' && subtotal >= 200000 && (
                    <div className="text-[9px] text-[#A3B18A] line-through font-bold leading-none">
                      {formatPrice(9500)}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-[#3A4031] font-semibold">{formatPrice(costoEnvio)}</span>
              )}
            </div>
          </div>

          {descuento > 0 && (
            <div className="flex justify-between text-xs font-bold text-[#A3B18A] bg-[#A3B18A]/10 p-2 rounded-lg border border-[#A3B18A]/20">
              <span>Beneficio aplicado</span>
              <span>-{formatPrice(descuento)}</span>
            </div>
          )}
        </div>

        <Separator className="bg-[#F5F5F0]" />

        {/* Total Final */}
        <div className="flex justify-between items-baseline pt-2">
          <span className="text-sm font-bold text-[#3A4031] uppercase tracking-[0.2em]">Total Final</span>
          <div className="text-right">
            <span className="text-3xl font-serif font-bold text-[#4A5D45]">
              {formatPrice(total)}
            </span>
            <p className="text-[9px] text-[#A3B18A] uppercase font-bold tracking-tighter mt-1 italic">
              Preparación Magistral Garantizada
            </p>
          </div>
        </div>

        {/* Nota informativa dinámica */}
        <div className="bg-[#F9F9F7] rounded-xl p-4 border border-[#E9E9E0]">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-[#A3B18A] mt-0.5" />
            <div className="space-y-2 text-[10px] leading-relaxed text-[#5B6350] font-medium uppercase tracking-tight">
              <p>• {entrega.note}</p>
              <p>• Recibirás la confirmación del pedido en tu correo.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}