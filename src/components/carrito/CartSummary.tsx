import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Calcular envío gratis
  const ENVIO_GRATIS_MINIMO = 200000
  const envioGratis = subtotal >= ENVIO_GRATIS_MINIMO
  const faltaParaEnvioGratis = ENVIO_GRATIS_MINIMO - subtotal

  // Calcular costo de envío final
  const costoEnvioFinal = envioGratis ? 0 : costoEnvio || 9500

  // Calcular total
  const total = subtotal + costoEnvioFinal - descuento

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span>Subtotal ({cantidadItems} producto{cantidadItems !== 1 ? 's' : ''})</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {/* Envío gratis progress */}
        {!envioGratis && faltaParaEnvioGratis > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-sm text-amber-800 mb-2">
              <strong>¡Envío gratis disponible!</strong>
            </div>
            <div className="text-xs text-amber-700 mb-2">
              Agregá {formatPrice(faltaParaEnvioGratis)} más para envío gratis
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((subtotal / ENVIO_GRATIS_MINIMO) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Envío */}
        <div className="flex justify-between text-sm">
          <span>Envío</span>
          <div className="text-right">
            {envioGratis ? (
              <div>
                <span className="text-green-600 font-medium">Gratis</span>
                <div className="text-xs text-gray-500 line-through">
                  {formatPrice(200000)}
                </div>
              </div>
            ) : (
              <span className="font-medium">{formatPrice(costoEnvioFinal)}</span>
            )}
          </div>
        </div>

        {/* Descuento */}
        {descuento > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Descuento aplicado</span>
            <span className="font-medium">-{formatPrice(descuento)}</span>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-rose-600">{formatPrice(total)}</span>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Los precios incluyen IVA</p>
          <p>• Aceptamos todos los medios de pago</p>
          <p>• Pago 100% seguro con Mercado Pago</p>
        </div>

        {/* Métodos de pago */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Medios de pago
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              💳 Tarjetas
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              💰 Efectivo
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              🏦 Transferencia
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}