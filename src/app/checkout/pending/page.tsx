import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, RefreshCw, ArrowLeft, MessageCircle } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ pedido?: string }>
}

export default async function CheckoutPendingPage({ searchParams }: PageProps) {
  const { pedido: pedidoId } = await searchParams

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icono de pendiente */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-12 w-12 text-amber-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tu pago está siendo procesado
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Recibimos tu pedido y estamos confirmando el pago. 
          Te notificaremos por email cuando esté listo.
        </p>

        {/* Información del pedido */}
        {pedidoId && (
          <Card className="mb-8 text-left">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Estado del pedido
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ID del pedido:</span>
                  <span className="font-medium">{pedidoId.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estado del pago:</span>
                  <span className="font-medium text-amber-600">Pendiente de confirmación</span>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-700">
                  <strong>⏳ Tiempo estimado:</strong> La confirmación puede demorar 
                  entre 5 minutos y 2 horas hábiles, dependiendo del medio de pago utilizado.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Qué esperar */}
        <Card className="mb-8 text-left">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              ¿Qué va a pasar ahora?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-amber-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Confirmación del pago</p>
                  <p className="text-sm text-gray-600">
                    Estamos verificando tu pago con el banco o entidad emisora
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-amber-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notificación por email</p>
                  <p className="text-sm text-gray-600">
                    Te enviaremos un email cuando el pago sea confirmado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-amber-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Inicio de producción</p>
                  <p className="text-sm text-gray-600">
                    Una vez confirmado, comenzaremos la preparación de tus productos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mi-cuenta/pedidos">
              <Button className="bg-rose-600 hover:bg-rose-700 px-8">
                <RefreshCw className="h-5 w-5 mr-2" />
                Ver estado del pedido
              </Button>
            </Link>
            
            <a 
              href="https://wa.me/541122334455?text=Hola!%20Tengo%20una%20consulta%20sobre%20el%20estado%20de%20mi%20pago"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="px-8">
                <MessageCircle className="h-5 w-5 mr-2" />
                Consultar por WhatsApp
              </Button>
            </a>
          </div>

          <p className="text-sm text-gray-500">
            Si tu pago fue rechazado, recibirás un email y podrás intentar nuevamente
          </p>

          <Link href="/">
            <Button variant="ghost" className="text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Medios de pago alternativos */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center space-y-4">
            <h3 className="font-medium text-gray-900">
              Medios de pago disponibles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Tarjetas</p>
                <p className="text-gray-600">Crédito y débito</p>
                <p className="text-green-600">Hasta 12 cuotas</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Transferencia</p>
                <p className="text-gray-600">Banco o billetera virtual</p>
                <p className="text-blue-600">Acreditación inmediata</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Efectivo</p>
                <p className="text-gray-600">PagoFácil, Rapipago</p>
                <p className="text-purple-600">2-3 días hábiles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}