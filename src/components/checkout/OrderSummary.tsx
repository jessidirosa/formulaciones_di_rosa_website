import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resumen del pedido</span>
          <Badge variant="secondary">
            {items.length} producto{items.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de productos */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.producto.id} className="flex gap-3">
              <img
                src={item.producto.imagen}
                alt={item.producto.nombre}
                className="w-12 h-12 object-cover rounded bg-gray-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `https://placehold.co/48x48?text=${encodeURIComponent(item.producto.nombre)}`
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 line-clamp-2">
                  {item.producto.nombre}
                </p>
                <p className="text-xs text-gray-500">
                  {item.producto.categoria}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-600">
                    Cantidad: {item.cantidad}
                  </span>
                  <span className="text-sm font-medium">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Cálculos */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>
              Envío ({tipoEntrega === 'RETIRO_LOCAL' ? 'Retiro local' : 'A domicilio'})
            </span>
            <div className="text-right">
              {costoEnvio === 0 ? (
                <div>
                  <span className="text-green-600 font-medium">Gratis</span>
                  {tipoEntrega === 'ENVIO_DOMICILIO' && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatPrice(9500)}
                    </div>
                  )}
                </div>
              ) : (
                <span className="font-medium">{formatPrice(costoEnvio)}</span>
              )}
            </div>
          </div>

          {descuento > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento aplicado</span>
              <span className="font-medium">-{formatPrice(descuento)}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-rose-600">{formatPrice(total)}</span>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p>• Precios incluyen IVA</p>
          <p>• Pago procesado por Mercado Pago</p>
          {tipoEntrega === 'ENVIO_DOMICILIO' && (
            <p>• Tiempo de envío: 3-7 días hábiles</p>
          )}
          {tipoEntrega === 'RETIRO_LOCAL' && (
            <p>• Coordinaremos horario de retiro</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}