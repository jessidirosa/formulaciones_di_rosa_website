'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { FlaskConical, Truck, ShieldCheck, ArrowRight, Sparkles, CreditCard } from 'lucide-react'

// --- INTERFACES ---
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
  beneficios?: string | null
  tiposPiel?: string | null
  modoUso?: string | null
}

type ProductoRelacionado = {
  id: number
  nombre: string
  slug: string
  descripcionCorta: string | null
  categoria: string | null
  precio: number
  imagen: string | null
  stock: number | null
  destacado: boolean
}

interface ProductDetailProps {
  producto: ProductoDetalle
  productosRelacionados: ProductoRelacionado[]
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value)

export default function ProductDetail({
  producto,
  productosRelacionados,
}: ProductDetailProps) {
  const { addItem } = useCart()

  const precioTransferencia = producto.precio * 0.9
  const codigoPublico = String(producto.id).padStart(6, '0').slice(-6).toUpperCase()
  const imagenPrincipal = producto.imagen || '/images/placeholder-producto.jpg'
  const stockNum = producto.stock ?? 0
  const hayStock = stockNum > 0

  const handleAdd = () => {
    if (!hayStock) return
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      slug: producto.slug,
      precio: producto.precio,
      imagen: producto.imagen,
      categoria: producto.categoria
    } as any, 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* Columna Izquierda: Galería de Imagen */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white">
            <div className="relative aspect-[4/5] md:aspect-square">
              <Image
                src={imagenPrincipal}
                alt={producto.nombre}
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {producto.destacado && (
                  <Badge className="bg-[#4A5D45] text-white border-none uppercase tracking-widest text-[10px] px-3 py-1">
                    Fórmula Destacada
                  </Badge>
                )}
                {!hayStock && (
                  <Badge variant="destructive" className="uppercase tracking-widest text-[10px] px-3 py-1">
                    Sin Stock Temporal
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-between items-center px-4 py-2 bg-[#E9E9E0] rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold text-[#5B6350]">
            <span>Referencia: {codigoPublico}</span>
            <span className="flex items-center gap-1">
              <FlaskConical className="w-3 h-3" /> Magistral
            </span>
          </div>
        </div>

        {/* Columna Derecha: Información y Compra */}
        <div className="flex flex-col space-y-8">
          <header className="space-y-4">
            <nav className="text-[10px] uppercase tracking-widest text-[#A3B18A] font-bold flex gap-2">
              <Link href="/tienda" className="hover:text-[#4A5D45]">Tienda</Link>
              <span>/</span>
              <span>{producto.categoria || 'Cosmética'}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-[#3A4031] leading-tight uppercase tracking-tight">
              {producto.nombre}
            </h1>
            {producto.descripcionCorta && (
              /* APLICADO: whitespace-pre-line para saltos de línea */
              <p className="text-[#5B6350] text-lg leading-relaxed italic border-l-2 border-[#A3B18A] pl-4 whitespace-pre-line">
                {producto.descripcionCorta}
              </p>
            )}
          </header>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-[#E9E9E0] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#A3B18A] font-bold">
                  <CreditCard className="w-3 h-3" /> Precio de Lista
                </div>
                <p className="text-2xl font-medium text-[#5B6350] line-through decoration-[#D6D6C2] opacity-70">
                  {formatPrice(producto.precio)}
                </p>
                <p className="text-[9px] text-[#A3B18A] font-medium leading-tight">
                  Hasta 3 cuotas sin interés con Mercado Pago
                </p>
              </div>

              <div className="bg-[#F9F9F7] p-5 rounded-2xl border border-[#E9E9E0] relative overflow-hidden group">
                <div className="absolute top-0 right-0">
                  <Badge className="bg-[#A3B18A] text-white border-none text-[9px] font-bold rounded-none rounded-bl-lg">
                    10% OFF
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#4A5D45] font-bold mb-1">
                  <Sparkles className="w-3 h-3" /> Transferencia
                </div>
                <p className="text-4xl font-serif font-bold text-[#4A5D45]">
                  {formatPrice(precioTransferencia)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[#5B6350] text-xs py-3 border-y border-[#F5F5F0]">
              <Truck className="w-4 h-4 text-[#A3B18A]" />
              <p>Envío sin cargo en pedidos superiores a <span className="font-bold text-[#4A5D45]">{formatPrice(200000)}</span></p>
            </div>

            <Button
              size="lg"
              className={`w-full h-16 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg
                ${hayStock
                  ? 'bg-[#4A5D45] text-white hover:bg-[#3D4C39] hover:shadow-[#4A5D45]/20'
                  : 'bg-gray-200 text-gray-400'}`}
              onClick={handleAdd}
              disabled={!hayStock}
            >
              {hayStock ? 'Añadir al Carrito' : 'Agotado Temporalmente'}
            </Button>

            <div className="flex justify-center gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-tighter text-[#A3B18A] font-bold">
                <ShieldCheck className="w-3 h-3" /> Pago Seguro SSL
              </div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-tighter text-[#A3B18A] font-bold">
                <FlaskConical className="w-3 h-3" /> Calidad Magistral
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {(producto.descripcionLarga || producto.modoUso) && (
              <Card className="border-none bg-[#E9E9E0]/40 rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-[#4A5D45] font-bold">
                    Detalles de la Formulación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-[#3A4031]">
                  {producto.descripcionLarga && (
                    /* APLICADO: whitespace-pre-line para saltos de línea */
                    <p className="whitespace-pre-line">{producto.descripcionLarga}</p>
                  )}
                  {producto.modoUso && (
                    <div className="bg-white/50 p-4 rounded-2xl border border-[#D6D6C2]">
                      <p className="font-bold text-[#4A5D45] mb-2 uppercase text-[10px] tracking-widest">Modo de aplicación</p>
                      {/* APLICADO: whitespace-pre-line por si el modo de uso también tiene saltos */}
                      <p className="italic text-[#5B6350] leading-relaxed whitespace-pre-line">{producto.modoUso}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Productos Relacionados */}
      {productosRelacionados.length > 0 && (
        <section className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#3A4031] uppercase tracking-tight">
              Complementa tu tratamiento
            </h2>
            <div className="h-[2px] flex-1 mx-8 bg-[#E9E9E0] hidden md:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosRelacionados.map((rel: ProductoRelacionado) => {
              const relTransfer = rel.precio * 0.9
              return (
                <Card key={rel.id} className="group border-none shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-500">
                  <Link href={`/tienda/${rel.slug}`}>
                    <div className="relative aspect-square">
                      <Image
                        src={rel.imagen || '/images/placeholder-producto.jpg'}
                        alt={rel.nombre}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-5">
                      <p className="text-[9px] uppercase tracking-widest text-[#A3B18A] font-bold mb-1">{rel.categoria}</p>
                      <h3 className="font-bold text-[#3A4031] text-sm group-hover:text-[#4A5D45] transition-colors line-clamp-1 uppercase">
                        {rel.nombre}
                      </h3>
                      <div className="mt-4 flex flex-col">
                        <span className="text-[10px] text-[#A3B18A] line-through decoration-[#D6D6C2] font-medium">{formatPrice(rel.precio)}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-[#4A5D45] text-lg">{formatPrice(relTransfer)}</span>
                          <ArrowRight className="w-4 h-4 text-[#A3B18A] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}