import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Truck, ShieldCheck, CreditCard } from 'lucide-react'

interface CartSummaryProps {
  subtotal: number
  cantidadItems: number
  costoEnvio?: number
  descuento?: number
}

export default function CartSummary({
  subtotal,
  cantidadItems,
  costoEnvio = 0,
  descuento = 0
}: CartSummaryProps) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const ENVIO_GRATIS_MINIMO = 200000
  const envioGratis = subtotal >= ENVIO_GRATIS_MINIMO
  const faltaParaEnvioGratis = ENVIO_GRATIS_MINIMO - subtotal
  const porcentajeProgreso = Math.min((subtotal / ENVIO_GRATIS_MINIMO) * 100, 100)

  const costoEnvioFinal = envioGratis ? 0 : costoEnvio || 9500
  const total = subtotal + costoEnvioFinal - descuento

  return (
    <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-[#F9F9F7] border-b border-[#E9E9E0]">
        <CardTitle className="text-sm uppercase tracking-[0.2em] font-bold text-[#4A5D45]">
          Resumen de Pedido
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Detalle de costos */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-[#5B6350]">
            <span>Productos ({cantidadItems})</span>
            <span className="font-semibold text-[#3A4031]">{formatPrice(subtotal)}</span>
          </div>

          {/* Barra de progreso Envío Gratis - Estética Di Rosa */}
          <div className="py-2">
            {!envioGratis ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-[#A3B18A]">
                  <span>Faltan {formatPrice(faltaParaEnvioGratis)} para envío gratis</span>
                  <span>{Math.round(porcentajeProgreso)}%</span>
                </div>
                <div className="w-full bg-[#F5F5F0] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#A3B18A] h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${porcentajeProgreso}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#4A5D45] bg-[#E9E9E0] p-2 rounded-xl text-[10px] uppercase tracking-widest font-bold justify-center">
                <Truck className="w-3 h-3" /> ¡Tu envío es sin cargo!
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm text-[#5B6350]">
            <span>Costo de Envío</span>
            <span className={envioGratis ? "text-[#4A5D45] font-bold" : "font-semibold text-[#3A4031]"}>
              {envioGratis ? "Bonificado" : formatPrice(costoEnvioFinal)}
            </span>
          </div>

          {descuento > 0 && (
            <div className="flex justify-between text-sm text-[#A3B18A] bg-[#A3B18A]/10 p-2 rounded-lg border border-[#A3B18A]/20 font-bold">
              <span>Beneficio aplicado</span>
              <span>-{formatPrice(descuento)}</span>
            </div>
          )}
        </div>

        <Separator className="bg-[#F5F5F0]" />

        {/* Total Final */}
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold text-[#3A4031] uppercase tracking-widest">Total</span>
          <div className="text-right">
            <span className="text-3xl font-serif font-bold text-[#4A5D45]">
              {formatPrice(total)}
            </span>
            <p className="text-[9px] text-[#A3B18A] uppercase font-bold tracking-tighter mt-1">IVA Incluido</p>
          </div>
        </div>

        {/* Garantías sutiles */}
        <div className="grid grid-cols-1 gap-2 pt-4 border-t border-[#F5F5F0]">
          <div className="flex items-center gap-2 text-[10px] text-[#5B6350] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A3B18A]" />
            Pago 100% encriptado y seguro
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#5B6350] font-medium">
            <CreditCard className="w-3.5 h-3.5 text-[#A3B18A]" />
            Mercado Pago • Transferencia • Tarjetas
          </div>
        </div>

        {/* Tags de Medios de Pago - Diseño Limpio */}
        <div className="flex flex-wrap gap-2 pt-2">
          {['Visa', 'Mastercard', 'Amex', 'Transferencia'].map((pago) => (
            <span key={pago} className="text-[8px] uppercase tracking-widest border border-[#E9E9E0] px-2 py-1 rounded text-[#A3B18A] font-bold bg-[#F9F9F7]">
              {pago}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}