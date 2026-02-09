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

type Categoria = {
  id: number
  nombre: string
  slug: string
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
  categorias?: { categoria: Categoria }[] // ✅ Relación con categorías de la DB
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
  const [imagenError, setImagenError] = useState(false)

  const [seleccion, setSeleccion] = useState<Presentacion | null>(
    producto.presentaciones && producto.presentaciones.length > 0 ? producto.presentaciones[0] : null
  )

  const imageSrc = !imagenError && producto.imagen
    ? producto.imagen
    : `https://placehold.co/800x800/F5F5F0/4A5D45?text=${encodeURIComponent(producto.nombre)}`

  const precioActual = seleccion ? seleccion.precio : producto.precio
  const precioTransferencia = precioActual * 0.9
  const stockActual = seleccion ? seleccion.stock : (producto.stock ?? 0)
  const hayStock = stockActual > 0

  const handleAdd = () => {
    if (!hayStock) return
    addItem({
      ...producto,
      id: seleccion ? `${producto.id}-${seleccion.id}` : producto.id,
      nombre: seleccion ? `${producto.nombre} (${seleccion.nombre})` : producto.nombre,
      precio: precioActual,
      imagen: producto.imagen
    } as any, 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
        <div className="space-y-4">
          <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white">
            <div className="relative aspect-square">
              <img
                src={imageSrc}
                alt={producto.nombre}
                className="w-full h-full object-cover transition-all duration-700"
                onError={() => setImagenError(true)}
              />
              {producto.destacado && (
                <div className="absolute top-6 left-6">
                  <Badge className="bg-[#4A5D45] text-[#F5F5F0] border-none px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold shadow-lg">
                    Fórmula Destacada
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col space-y-6">
          <header className="space-y-3">
            {/* ✅ TAGS DE CATEGORÍAS MEJORADOS */}
            <div className="flex flex-wrap gap-2">
              {producto.categorias && producto.categorias.length > 0 ? (
                producto.categorias.map((rel) => (
                  <Badge
                    key={rel.categoria.id}
                    className="bg-[#A3B18A]/10 text-[#4A5D45] border-[#A3B18A]/20 px-3 py-1 text-[9px] uppercase tracking-[0.1em] font-bold"
                  >
                    {rel.categoria.nombre}
                  </Badge>
                ))
              ) : (
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A]">
                  {producto.categoria || 'Cosmética Magistral'}
                </p>
              )}
            </div>

            <h1 className="text-4xl font-bold text-[#3A4031] uppercase tracking-tight">{producto.nombre}</h1>
            <p className="text-[#5B6350] text-lg italic whitespace-pre-line leading-relaxed border-l-4 border-[#A3B18A]/30 pl-4">
              {producto.descripcionCorta}
            </p>
          </header>

          {producto.presentaciones && producto.presentaciones.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-bold text-[#A3B18A] tracking-widest">Seleccionar Tamaño</p>
              <div className="flex flex-wrap gap-2">
                {producto.presentaciones.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSeleccion(p)}
                    className={`px-6 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${seleccion?.id === p.id
                      ? 'bg-[#4A5D45] text-white border-[#4A5D45] shadow-md scale-105'
                      : 'bg-white text-[#5B6350] border-[#E9E9E0] hover:bg-[#F9F9F7] hover:border-[#A3B18A]'
                      }`}
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] border border-[#E9E9E0] shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-[#A3B18A] flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Pago por Transferencia
                </p>
                <p className="text-5xl font-serif font-bold text-[#4A5D45]">{formatPrice(precioTransferencia)}</p>
              </div>
              <div className="text-right">
                <Badge className="bg-[#A3B18A]/10 text-[#4A5D45] border-none mb-2 font-bold">10% OFF</Badge>
                <p className="text-sm text-gray-400 line-through font-medium">{formatPrice(precioActual)}</p>
              </div>
            </div>

            <Button
              onClick={handleAdd}
              disabled={!hayStock}
              className={`w-full h-16 rounded-2xl font-bold uppercase tracking-widest transition-all duration-500 shadow-lg ${hayStock
                ? 'bg-[#4A5D45] text-white hover:bg-[#3A4031] hover:shadow-[#4A5D45]/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {hayStock ? (
                <span className="flex items-center gap-2">Añadir al Carrito <ArrowRight className="h-4 w-4" /></span>
              ) : 'Sin Stock en esta medida'}
            </Button>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F5F5F0]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#5B6350] uppercase tracking-tighter">
                <ShieldCheck className="h-4 w-4 text-[#A3B18A]" /> Garantía Magistral
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#5B6350] uppercase tracking-tighter">
                <Truck className="h-4 w-4 text-[#A3B18A]" /> Envíos Seguros
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {producto.descripcionLarga && (
              <Card className="border-none bg-[#E9E9E0]/30 rounded-[2rem] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] uppercase font-bold text-[#4A5D45] tracking-widest flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" /> Composición y Detalles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm text-[#3A4031] leading-relaxed">
                    {producto.descripcionLarga}
                  </p>
                </CardContent>
              </Card>
            )}

            {productosRelacionados.length > 0 && (
              <div className="pt-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-[#3A4031] uppercase tracking-widest">También te puede interesar</h3>
                  <div className="h-[1px] flex-grow ml-6 bg-[#E9E9E0]"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {productosRelacionados.map((rel) => (
                    <Link key={rel.id} href={`/tienda/${rel.slug}`} className="group text-left">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-[#F9F9F7] mb-3 border border-[#E9E9E0] relative shadow-sm group-hover:shadow-md transition-all">
                        <img
                          src={rel.imagen || `https://placehold.co/400x400/F5F5F0/4A5D45?text=${encodeURIComponent(rel.nombre)}`}
                          alt={rel.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <p className="text-[8px] uppercase font-bold text-[#A3B18A] mb-1 tracking-widest">{rel.categoria || 'DI ROSA'}</p>
                      <p className="text-xs font-bold text-[#3A4031] group-hover:text-[#4A5D45] transition-colors leading-tight uppercase line-clamp-2">
                        {rel.nombre}
                      </p>
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