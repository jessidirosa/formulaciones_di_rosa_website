'use client'

import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import CartItem from '@/components/carrito/CartItem'
import CartSummary from '@/components/carrito/CartSummary'
import EstimatedDate from '@/components/carrito/EstimatedDate'
import { ShoppingBag, ArrowRight } from 'lucide-react'

export default function CarritoPage() {
  const { state } = useCart()
  const { isAuthenticated, user } = useUser()

  // Si el carrito está vacío
  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              ¡Explorá nuestros productos y encontrá lo que necesitas para el cuidado de tu piel!
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/tienda">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Explorar productos
              </Button>
            </Link>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">¿Buscás algo específico?</p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Link href="/tienda?categoria=Antiage">
                  <Button variant="outline" size="sm" className="w-full">
                    Antiage
                  </Button>
                </Link>
                <Link href="/tienda?categoria=Manchas">
                  <Button variant="outline" size="sm" className="w-full">
                    Antimanchas
                  </Button>
                </Link>
                <Link href="/tienda?categoria=Capilar">
                  <Button variant="outline" size="sm" className="w-full">
                    Capilar
                  </Button>
                </Link>
                <Link href="/tienda?categoria=Corporal">
                  <Button variant="outline" size="sm" className="w-full">
                    Corporal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Carrito de compras
        </h1>
        <p className="text-gray-600">
          {state.cantidadItems} producto{state.cantidadItems !== 1 ? 's' : ''} en tu carrito
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Productos</span>
                <Badge variant="secondary">
                  {state.cantidadItems} item{state.cantidadItems !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.items.map((item, index) => (
                <div key={item.producto.id}>
                  <CartItem item={item} />
                  {index < state.items.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Botón continuar comprando */}
          <div className="mt-6">
            <Link href="/tienda">
              <Button variant="outline" className="w-full">
                Continuar comprando
              </Button>
            </Link>
          </div>
        </div>

        {/* Resumen y checkout */}
        <div className="space-y-6">
          {/* Fecha estimada */}
          <EstimatedDate fechaEstimada={state.fechaEstimada} />

          {/* Resumen de la compra */}
          <CartSummary
            subtotal={state.total}
            cantidadItems={state.cantidadItems}
          />

          {/* Acciones de checkout */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {isAuthenticated ? (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      Conectado como <strong>{user?.nombre} {user?.apellido}</strong>
                    </div>
                    <Link href="/checkout" className="block">
                      <Button className="w-full bg-rose-600 hover:bg-rose-700 h-12" size="lg">
                        Proceder al checkout
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center mb-4">
                      Iniciá sesión para continuar con tu compra
                    </p>

                    <Link href="/mi-cuenta/login" className="block">
                      <Button className="w-full bg-rose-600 hover:bg-rose-700" size="lg">
                        Iniciar sesión
                      </Button>
                    </Link>

                    <div className="text-center text-sm text-gray-500">
                      ¿No tenés cuenta?{' '}
                      <Link href="/mi-cuenta/registro" className="text-rose-600 hover:text-rose-700 font-medium">
                        Registrate
                      </Link>
                    </div>

                    <Separator />

                    <Link href="/checkout" className="block">
                      <Button variant="outline" className="w-full" size="lg">
                        Continuar como invitado
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Envío gratis</p>
                  <p className="text-xs">
                    En compras mayores a $200.000
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}