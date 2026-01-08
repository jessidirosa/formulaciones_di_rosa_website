import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCw, ArrowLeft, MessageCircle } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ pedido?: string }>
}

export default async function CheckoutFailurePage({ searchParams }: PageProps) {
  const { pedido: pedidoId } = await searchParams

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icono de error */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          No pudimos procesar tu pago
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Hubo un problema al procesar el pago de tu pedido. 
          No te preocupes, podés intentar nuevamente.
        </p>

        {/* Información del pedido */}
        {pedidoId && (
          <Card className="mb-8 text-left">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Información del pedido
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">ID del pedido:</span>
                  <span className="font-medium ml-2">{pedidoId.slice(-8).toUpperCase()}</span>
                </p>
                <p className="text-amber-700">
                  El pedido queda guardado como "pendiente" hasta que completes el pago
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posibles causas */}
        <Card className="mb-8 text-left">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Posibles causas del problema
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Datos de tarjeta incorrectos o expirada</li>
              <li>• Fondos insuficientes en la cuenta</li>
              <li>• Límites de compra por internet</li>
              <li>• Problemas temporales de conectividad</li>
              <li>• Restricciones del banco emisor</li>
            </ul>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/carrito">
              <Button className="bg-rose-600 hover:bg-rose-700 px-8">
                <RefreshCw className="h-5 w-5 mr-2" />
                Intentar de nuevo
              </Button>
            </Link>
            
            <a 
              href="https://wa.me/541122334455?text=Hola!%20Tuve%20un%20problema%20con%20el%20pago%20de%20mi%20pedido%20en%20Formulaciones%20Di%20Rosa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="px-8">
                <MessageCircle className="h-5 w-5 mr-2" />
                Contactar soporte
              </Button>
            </a>
          </div>

          <div className="text-sm text-gray-500">
            <p>
              Si el problema persiste, contactanos por WhatsApp y te ayudamos 
              a completar tu compra
            </p>
          </div>

          <Link href="/">
            <Button variant="ghost" className="text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center space-y-4">
            <h3 className="font-medium text-gray-900">
              ¿Necesitás ayuda con tu pago?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">WhatsApp</p>
                <p className="text-gray-600">Respuesta inmediata</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Email</p>
                <p className="text-gray-600">info@formulacionesdirosa.com</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Horarios</p>
                <p className="text-gray-600">Lun a Vie 9-18hs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}