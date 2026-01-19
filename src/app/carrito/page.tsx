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
import { ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react'

export default function CarritoPage() {
  const { state } = useCart()
  const { isAuthenticated, user } = useUser()

  // 1. ESTADO: CARRITO VACÍO (Refinado con estética Di Rosa)
  if (state.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center bg-[#F5F5F0]">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-[#E9E9E0] rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-[#A3B18A]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#3A4031] mb-4">
                Tu carrito está esperando
              </h1>
              <p className="text-[#5B6350] mb-8 text-lg">
                Todavía no sumaste ninguna de nuestras formulaciones magistrales.
                ¡Explorá nuestras líneas exclusivas y encontrá el cuidado que tu piel merece!
              </p>
            </div>

            <div className="space-y-8">
              <Link href="/tienda">
                <Button size="lg" className="bg-[#4A5D45] hover:bg-[#3D4C39] text-[#F5F5F0] px-10 rounded-full font-bold shadow-lg">
                  Ir a la Tienda Online
                </Button>
              </Link>

              <div className="pt-8 border-t border-[#D6D6C2]">
                <p className="text-xs uppercase tracking-widest text-[#A3B18A] font-bold mb-6">¿Qué estás buscando hoy?</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {['Antiage', 'Capilar', 'Corporal', 'Solares'].map((cat) => (
                    <Link key={cat} href={`/tienda?categoria=${cat}`}>
                      <Button variant="outline" size="sm" className="w-full border-[#D6D6C2] text-[#5B6350] hover:bg-white hover:border-[#4A5D45] rounded-lg">
                        {cat}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. ESTADO: CARRITO CON PRODUCTOS
  return (
    <div className="min-h-screen bg-[#F5F5F0] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 border-l-4 border-[#4A5D45] pl-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3A4031] mb-2">
            Tu Selección Magistral
          </h1>
          <p className="text-[#5B6350] font-medium italic">
            {state.cantidadItems} producto{state.cantidadItems !== 1 ? 's' : ''} listo{state.cantidadItems !== 1 ? 's' : ''} para preparar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Columna Izquierda: Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="bg-[#F9F9F7] border-b border-[#E9E9E0]">
                <CardTitle className="flex items-center justify-between text-[#3A4031] text-lg">
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#4A5D45]" />
                    Detalle del pedido
                  </span>
                  <Badge className="bg-[#E9E9E0] text-[#4A5D45] border-none">
                    {state.cantidadItems} {state.cantidadItems === 1 ? 'Producto' : 'Productos'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#F5F5F0]">
                  {state.items.map((item) => (
                    <div key={item.producto.id} className="p-6 hover:bg-[#F9F9F7] transition-colors">
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Link href="/tienda" className="inline-flex items-center gap-2 text-[#4A5D45] font-bold text-sm hover:underline ml-2">
              ← Seguir explorando productos
            </Link>
          </div>

          {/* Columna Derecha: Resumen y Checkout */}
          <div className="space-y-6">

            {/* Beneficios sutiles */}
            <div className="bg-[#4A5D45] text-[#F5F5F0] p-5 rounded-2xl flex items-center justify-around shadow-md">
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="w-5 h-5 text-[#A3B18A]" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Pago Seguro</span>
              </div>
              <div className="w-[1px] h-8 bg-[#F5F5F0]/20"></div>
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-5 h-5 text-[#A3B18A]" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Envíos a todo el país</span>
              </div>
            </div>

            <EstimatedDate fechaEstimada={state.fechaEstimada} />

            <div className="bg-white rounded-2xl shadow-sm border border-[#E9E9E0] overflow-hidden">
              <div className="p-6">
                <CartSummary
                  subtotal={state.total}
                  cantidadItems={state.cantidadItems}
                />

                <Separator className="my-6 bg-[#F5F5F0]" />

                <div className="space-y-4">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-[#F9F9F7] rounded-lg border border-[#E9E9E0] flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#A3B18A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {user?.nombre?.charAt(0)}
                        </div>
                        <p className="text-xs text-[#5B6350]">
                          Comprando como <span className="font-bold text-[#3A4031]">{user?.nombre} {user?.apellido}</span>
                        </p>
                      </div>
                      <Link href="/checkout" className="block">
                        <Button className="w-full bg-[#4A5D45] hover:bg-[#3D4C39] text-[#F5F5F0] h-14 rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/10">
                          Finalizar Compra
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link href="/mi-cuenta/login" className="block">
                        <Button className="w-full bg-[#4A5D45] hover:bg-[#3D4C39] text-[#F5F5F0] h-12 rounded-xl font-bold">
                          Iniciar Sesión para Comprar
                        </Button>
                      </Link>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E9E9E0]"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-[#A3B18A] font-bold">o también</span></div>
                      </div>

                      <Link href="/checkout" className="block">
                        <Button variant="outline" className="w-full border-[#D6D6C2] text-[#5B6350] hover:bg-[#F9F9F7] h-12 rounded-xl font-bold">
                          Continuar como Invitado
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Banner de Envío Gratis mejorado */}
            <div className="bg-[#E9E9E0] border border-[#D6D6C2] p-5 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="bg-[#4A5D45] p-2 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#3A4031] text-sm uppercase tracking-tight">Envío sin cargo</p>
                  <p className="text-xs text-[#5B6350]">
                    Bonificado en compras superiores a <span className="font-bold text-[#4A5D45]">$200.000</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}