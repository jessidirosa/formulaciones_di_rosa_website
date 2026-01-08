import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Calendar, Truck, MapPin, Phone, Mail } from 'lucide-react'
import { formatearFechaArgentina } from '@/lib/capacity'

interface PageProps {
  searchParams: Promise<{ pedido?: string }>
}

async function getPedido(pedidoId: string) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        items: {
          include: {
            producto: true
          }
        }
      }
    })
    return pedido
  } catch (error) {
    console.error('Error al obtener pedido:', error)
    return null
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(price)
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { pedido: pedidoId } = await searchParams

  if (!pedidoId) {
    notFound()
  }

  const pedido = await getPedido(pedidoId)

  if (!pedido) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header de confirmación */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Compra realizada con éxito!
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            Tu pedido <strong>#{pedido.numero}</strong> ha sido confirmado y está siendo procesado
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge className="bg-green-600 text-white px-4 py-2">
              Pago confirmado
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-600 px-4 py-2">
              {pedido.estado === 'PAGADO' ? 'En producción' : 'Pendiente de confirmación'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información del pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-rose-600" />
                Detalles del pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Número de pedido</p>
                  <p className="font-medium">{pedido.numero}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fecha</p>
                  <p className="font-medium">{formatearFechaArgentina(pedido.fechaCreacion)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tipo de entrega</p>
                  <p className="font-medium">
                    {pedido.tipoEntrega === 'RETIRO_LOCAL' ? 'Retiro en local' : 'Envío a domicilio'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total pagado</p>
                  <p className="font-bold text-rose-600">{formatPrice(pedido.total)}</p>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">
                      Fecha estimada de {pedido.tipoEntrega === 'RETIRO_LOCAL' ? 'retiro' : 'envío'}
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {formatearFechaArgentina(pedido.fechaEstimadaEnvio)}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Te contactaremos para coordinar los detalles
                    </p>
                  </div>
                </div>
              </div>

              {pedido.tipoEntrega === 'ENVIO_DOMICILIO' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Dirección de envío
                  </h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p>{pedido.direccion}</p>
                    <p>{pedido.ciudad}, {pedido.provincia}</p>
                    <p>CP: {pedido.codigoPostal}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-rose-600" />
                ¿Qué sigue ahora?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-rose-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmación por email</p>
                    <p className="text-sm text-gray-600">
                      Te enviamos un resumen completo a <strong>{pedido.emailCliente}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-rose-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Preparación del pedido</p>
                    <p className="text-sm text-gray-600">
                      Comenzamos la formulación magistral de tus productos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-rose-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Coordinación de entrega</p>
                    <p className="text-sm text-gray-600">
                      Te contactamos para coordinar {pedido.tipoEntrega === 'RETIRO_LOCAL' ? 'el retiro' : 'el envío'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  ¿Tenés alguna pregunta sobre tu pedido?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href={`https://wa.me/541122334455?text=Hola!%20Tengo%20una%20consulta%20sobre%20mi%20pedido%20${pedido.numero}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                  <Link href="/contacto" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productos del pedido */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Productos de tu pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pedido.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <img
                    src={item.producto?.imagen || `https://placehold.co/80x80?text=${encodeURIComponent(item.nombreProducto)}`}
                    alt={item.nombreProducto}
                    className="w-16 h-16 object-cover rounded bg-gray-100"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.nombreProducto}</h4>
                    <p className="text-sm text-gray-600">{item.categoriaProducto}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">
                        Cantidad: {item.cantidad}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tienda">
              <Button variant="outline" className="px-8">
                Seguir comprando
              </Button>
            </Link>
            <Link href="/mi-cuenta/pedidos">
              <Button className="bg-rose-600 hover:bg-rose-700 px-8">
                Ver mis pedidos
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            ¡Gracias por elegir Formulaciones Di Rosa!
          </p>
        </div>
      </div>
    </div>
  )
}