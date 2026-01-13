'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CheckoutData } from '@/app/checkout/page'
import { CreditCard, Gift, Loader2 } from 'lucide-react'

interface PaymentSectionProps {
  data: CheckoutData
  onChange: (data: Partial<CheckoutData>) => void
  onSubmit: () => Promise<void>
  onBack: () => void
  isProcessing: boolean
  total: number
}

export default function PaymentSection({
  data,
  onChange,
  onSubmit,
  onBack,
  isProcessing,
  total
}: PaymentSectionProps) {
  const [cuponCode, setCuponCode] = useState(data.cuponCodigo || '')
  const [cuponLoading, setCuponLoading] = useState(false)
  const [cuponError, setCuponError] = useState('')

  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Aplicar cupón de descuento
  const applyCoupon = async () => {
    if (!cuponCode.trim()) return

    setCuponLoading(true)
    setCuponError('')

    try {
      const response = await fetch('/api/cupones/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: cuponCode.trim().toUpperCase(),
          subtotal: total
        })
      })

      const result = await response.json()

      if (response.ok && result.valid) {
        onChange({
          cuponCodigo: result.cupon.codigo,
          cuponDescuento: result.descuentoAplicado
        })
        setCuponError('')
      } else {
        setCuponError(result.error || 'Cupón no válido')
        onChange({ cuponCodigo: undefined, cuponDescuento: undefined })
      }
    } catch (error) {
      setCuponError('Error al validar el cupón')
      onChange({ cuponCodigo: undefined, cuponDescuento: undefined })
    } finally {
      setCuponLoading(false)
    }
  }

  // Remover cupón
  const removeCoupon = () => {
    setCuponCode('')
    setCuponError('')
    onChange({ cuponCodigo: undefined, cuponDescuento: undefined })
  }

  const metodoPago = data.metodoPago || 'MERCADOPAGO'


  return (
    <div className="space-y-6">
      {/* Cupón de descuento */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-rose-600" />
          <Label className="text-base font-medium">
            ¿Tenés un cupón de descuento?
          </Label>
        </div>

        {data.cuponCodigo ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-green-600">
                      {data.cuponCodigo}
                    </Badge>
                    <span className="text-sm font-medium text-green-800">
                      Cupón aplicado
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Ahorrás {formatPrice(data.cuponDescuento || 0)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeCoupon}
                  className="text-green-700 border-green-300"
                >
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-2">
            <Input
              value={cuponCode}
              onChange={(e) => setCuponCode(e.target.value.toUpperCase())}
              placeholder="Ej: BIENVENIDO10"
              className={cuponError ? 'border-red-500' : ''}
              disabled={cuponLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={applyCoupon}
              disabled={cuponLoading || !cuponCode.trim()}
              className="shrink-0"
            >
              {cuponLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aplicar
            </Button>
          </div>
        )}

        {cuponError && (
          <p className="text-sm text-red-500">{cuponError}</p>
        )}

        {!data.cuponCodigo && (
          <p className="text-xs text-gray-500">
            Ingresá el código de tu cupón y presioná "Aplicar"
          </p>
        )}
      </div>

      <Separator />

      {/* Métodos de pago */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-rose-600" />
          <Label className="text-base font-medium">Método de pago</Label>
        </div>

        {/* Mercado Pago */}
        <Card
          className={`cursor-pointer border-2 ${metodoPago === 'MERCADOPAGO'
            ? 'border-rose-600'
            : 'border-gray-200'
            }`}
          onClick={() =>
            onChange({
              metodoPago: 'MERCADOPAGO',
            })
          }
        >
          <CardContent className="p-4">
            <h3 className="font-medium mb-1">Mercado Pago</h3>
            <p className="text-sm text-gray-600">
              Tarjetas, débito, dinero en cuenta
            </p>
          </CardContent>
        </Card>

        {/* Transferencia */}
        <Card
          className={`cursor-pointer border-2 ${metodoPago === 'TRANSFERENCIA'
            ? 'border-green-600'
            : 'border-gray-200'
            }`}
          onClick={() =>
            onChange({
              metodoPago: 'TRANSFERENCIA',
              aplicarDescuentoTransfer: true,
            })
          }
        >
          <CardContent className="p-4">
            <h3 className="font-medium text-green-700">
              Transferencia bancaria
            </h3>
            <p className="text-sm text-green-600">
              💸 10% más barato – tenés 1 hora para pagar
            </p>
          </CardContent>
        </Card>

        {/* Información de seguridad */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            🔒 Pago 100% seguro
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Tus datos están protegidos con encriptación SSL</li>
            <li>• Procesado por Mercado Pago, líder en pagos online</li>
            <li>• No guardamos información de tu tarjeta</li>
            <li>• Protección al comprador incluida</li>
          </ul>
        </div>
      </div>

      <Separator />

      {/* Confirmación */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            📋 Resumen de tu compra
          </h4>
          <p className="text-sm text-blue-800">
            {metodoPago === 'TRANSFERENCIA'
              ? 'Al finalizar, se generará tu pedido y verás los datos para transferir. Tenés 1 hora para enviar el pago.'
              : 'Al finalizar, serás redirigido a Mercado Pago para completar el pago.'}
          </p>

        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-rose-600 mb-2">
            Total a pagar: {formatPrice(total)}
          </div>

          {data.cuponDescuento && (
            <p className="text-sm text-green-600 mb-2">
              ¡Ahorrás {formatPrice(data.cuponDescuento)} con tu cupón!
            </p>
          )}

          {data.aplicarDescuentoTransfer && (
            <p className="text-sm text-green-600 mt-1">
              ✔ Descuento por transferencia aplicado (10%)
            </p>
          )}
        </div>

      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
        >
          Volver a entrega
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={isProcessing}
          className="bg-rose-600 hover:bg-rose-700 px-8"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Finalizar compra
            </>
          )}
        </Button>
      </div>

      {/* Políticas */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>
          Al finalizar la compra aceptás nuestros{' '}
          <a href="/politicas/terminos-condiciones" className="text-rose-600 hover:underline">
            términos y condiciones
          </a>{' '}
          y{' '}
          <a href="/politicas/privacidad" className="text-rose-600 hover:underline">
            política de privacidad
          </a>
        </p>
      </div>
    </div>
  )
}