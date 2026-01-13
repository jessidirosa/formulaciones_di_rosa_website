'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Package, Settings, LogOut, Calendar, Eye, Phone } from 'lucide-react'

interface Pedido {
  id: string
  numero: string
  fechaCreacion: string
  estado: string
  estadoPago: string
  total: number
  cantidadItems: number
  fechaEstimadaEnvio: string
  publicToken?: string | null
}


export default function MiCuentaPage() {
  const { user, isAuthenticated, isLoading, logout } = useUser()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosLoading, setPedidosLoading] = useState(true)

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/mi-cuenta/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Cargar pedidos del usuario
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPedidos()
    }
  }, [isAuthenticated, user])

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos/mis-pedidos', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setPedidos(data.pedidos || [])
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
    } finally {
      setPedidosLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Formatear fecha
  function formatDate(value?: string | Date | null) {
    if (!value) return "-" // si no hay valor, devolvemos un guion

    const date = value instanceof Date ? value : new Date(value)

    if (isNaN(date.getTime())) {
      return "-" // evita que aparezca "Invalid Date"
    }

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }


  // Obtener badge del estado
  const getEstadoBadge = (estado: string) => {
    const e = (estado || "").toLowerCase()

    if (e === "pending_payment_transfer") return <Badge variant="secondary">Pendiente de pago (transferencia)</Badge>
    if (e === "transfer_proof_sent") return <Badge className="bg-amber-600">Comprobante enviado</Badge>
    if (e === "confirmado") return <Badge className="bg-blue-600">Confirmado</Badge>
    if (e === "cancelled_expired") return <Badge variant="destructive">Cancelado (venció)</Badge>
    if (e === "cancelado") return <Badge variant="destructive">Cancelado</Badge>
    if (e === "en_produccion") return <Badge className="bg-orange-600">En producción</Badge>
    if (e === "listo_envio") return <Badge className="bg-green-600">Listo para envío</Badge>
    if (e === "enviado") return <Badge className="bg-purple-600">Enviado</Badge>
    if (e === "entregado") return <Badge className="bg-green-800">Entregado</Badge>

    return <Badge variant="secondary">En proceso</Badge>
  }


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Se redirecciona en useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Hola, {user.nombre}!
            </h1>
            <p className="text-gray-600">
              Gestiona tu cuenta y revisa tus pedidos
            </p>
          </div>

          {user.esAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="border-green-300 text-yellow-600">
                <Settings className="h-4 w-4 mr-2" />
                Panel Admin
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar con información del usuario */}
          <div className="space-y-6">
            {/* Información personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-rose-600" />
                  Tu perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre completo</p>
                  <p className="font-medium">{user.nombre} {user.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.telefono && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{user.telefono}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Miembro desde</p>
                  <p className="font-medium">
                    {formatDate(user?.creadoEn)}
                  </p>
                </div>


                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Editar perfil
                    <span className="text-xs ml-2">(Próximamente)</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-red-600" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Acciones rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/tienda" className="block">
                  <Button variant="outline" className="w-full">
                    Explorar productos
                  </Button>
                </Link>
                <a
                  href="https://wa.me/541137024467?text=Hola!%20Soy%20cliente%20de%20Formulaciones%20Di%20Rosa%20y%20tengo%20una%20consulta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar por WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal - Pedidos */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-rose-600" />
                  Mis pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pedidosLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : pedidos.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      No tenés pedidos aún
                    </h3>
                    <p className="text-gray-600 mb-4">
                      ¡Explorá nuestros productos y hace tu primer pedido!
                    </p>
                    <Link href="/tienda">
                      <Button className="bg-rose-600 hover:bg-rose-700">
                        Ir a la tienda
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pedidos.slice(0, 5).map((pedido) => (
                      <Card key={pedido.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Pedido #{pedido.numero}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatDate(pedido.fechaCreacion)} • {pedido.cantidadItems} producto{pedido.cantidadItems !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              {getEstadoBadge(pedido.estado)}
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatPrice(pedido.total)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Estimado: {formatDate(pedido.fechaEstimadaEnvio)}</span>
                            </div>

                            <Link href={pedido.publicToken ? `/pedido/${pedido.publicToken}` : `/mi-cuenta`}>

                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalle
                              </Button>
                            </Link>


                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {pedidos.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" disabled>
                          Ver todos los pedidos
                          <span className="text-xs ml-2">(Próximamente)</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-medium text-blue-900 mb-3">
                  📋 Información sobre tus pedidos
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Pendiente:</strong> Esperando confirmación de pago</li>
                  <li>• <strong>En producción:</strong> Estamos preparando tus productos</li>
                  <li>• <strong>Listo:</strong> Tu pedido está terminado</li>
                  <li>• <strong>Enviado:</strong> En camino a tu domicilio</li>
                  <li>• <strong>Entregado:</strong> Pedido completado</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}