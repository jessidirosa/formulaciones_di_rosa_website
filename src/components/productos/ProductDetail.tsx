'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { FlaskConical, Truck, ShieldCheck, ArrowRight, Sparkles, CreditCard } from 'lucide-react'

type Presentacion = {
  id: number
  nombre: string
  precio: number
  stock: number
}

type ProductoDetalle = {
  id: number
  nombre: string
  slug: string
  descripcionCorta: string | null
  descripcionLarga?: string | null
  categoria: string | null
  precio: number
  imagen: string | null
  stock: number | null
  destacado: boolean
  modoUso?: string | null
  presentaciones?: Presentacion[]
}

interface ProductDetailProps {
  producto: ProductoDetalle
  productosRelacionados: any[]
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value)

export default function ProductDetail({ producto, productosRelacionados }: ProductDetailProps) {
  const { addItem } = useCart()

  // 🔹 Inicializamos con la primera presentación o null
  const [seleccion, setSeleccion] = useState<Presentacion | null>(
    producto.presentaciones && producto.presentaciones.length > 0 ? producto.presentaciones[0] : null
  )

  const precioActual = seleccion ? seleccion.precio : producto.precio
  const precioTransferencia = precioActual * 0.9
  const stockActual = seleccion ? seleccion.stock : (producto.stock ?? 0)
  const hayStock = stockActual > 0
  const imagenPrincipal = producto.imagen || '/images/placeholder-producto.jpg'

  const handleAdd = () => {
    if (!hayStock) return
    addItem({
      ...producto,
      id: seleccion ? `${producto.id}-${seleccion.id}` : producto.id,
      nombre: seleccion ? `${producto.nombre} (${seleccion.nombre})` : producto.nombre,
      precio: precioActual,
    } as any, 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white">
            <div className="relative aspect-square">
              <Image src={imagenPrincipal} alt={producto.nombre} fill className="object-cover" priority />
            </div>
          </Card>
        </div>

        <div className="flex flex-col space-y-6">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold text-[#3A4031] uppercase">{producto.nombre}</h1>
            <p className="text-[#5B6350] text-lg italic whitespace-pre-line">{producto.descripcionCorta}</p>
          </header>

          {/* 🔹 Selector de Presentaciones */}
          {producto.presentaciones && producto.presentaciones.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-bold text-[#A3B18A]">Seleccionar Tamaño</p>
              <div className="flex flex-wrap gap-2">
                {producto.presentaciones.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSeleccion(p)}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${seleccion?.id === p.id
                      ? 'bg-[#4A5D45] text-white border-[#4A5D45]'
                      : 'bg-white text-[#5B6350] border-[#E9E9E0] hover:bg-[#F9F9F7]'
                      }`}
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-[2rem] border border-[#E9E9E0] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#A3B18A]">Transferencia (10% OFF)</p>
                <p className="text-4xl font-serif font-bold text-[#4A5D45]">{formatPrice(precioTransferencia)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 line-through">{formatPrice(precioActual)}</p>
              </div>
            </div>

            <Button
              onClick={handleAdd}
              disabled={!hayStock}
              className={`w-full h-16 rounded-2xl font-bold uppercase transition-all ${hayStock ? 'bg-[#4A5D45] text-white' : 'bg-gray-200 text-gray-400'}`}
            >
              {hayStock ? 'Añadir al Carrito' : 'Sin Stock'}
            </Button>
          </div>

          <div className="space-y-4">
            {producto.descripcionLarga && (
              <Card className="border-none bg-[#E9E9E0]/40 rounded-3xl">
                <CardHeader><CardTitle className="text-xs uppercase font-bold text-[#4A5D45]">Descripción</CardTitle></CardHeader>
                <CardContent><p className="whitespace-pre-line text-sm text-[#3A4031]">{producto.descripcionLarga}</p></CardContent>
              </Card>
            )}

            {productosRelacionados.length > 0 && (
              <div className="pt-12 border-t border-[#E9E9E0]">
                <h3 className="text-xl font-bold text-[#3A4031] mb-8 uppercase tracking-tight">También te puede interesar</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {productosRelacionados.map((rel) => (
                    <Link key={rel.id} href={`/tienda/${rel.slug}`} className="group">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-[#F9F9F7] mb-3 border border-[#E9E9E0]">
                        <img
                          src={rel.imagen || `https://placehold.co/200x200?text=${encodeURIComponent(rel.nombre)}`}
                          alt={rel.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-[10px] uppercase font-bold text-[#A3B18A] mb-1">{rel.categoria}</p>
                      <p className="text-sm font-bold text-[#3A4031] group-hover:text-[#4A5D45] transition-colors leading-tight">{rel.nombre}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}