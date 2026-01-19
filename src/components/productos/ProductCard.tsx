'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { ShoppingCart, Eye, FlaskConical, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Producto {
  id: string
  nombre: string
  slug: string
  descripcionCorta: string
  categoria: string
  precio: number
  imagen: string
  destacado: boolean
  stock: number
}

interface ProductCardProps {
  producto: Producto
}

export default function ProductCard({ producto }: ProductCardProps) {
  const { addItem } = useCart()
  const { isAuthenticated } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Cálculo del precio por transferencia (10% OFF)
  const precioTransferencia = producto.precio * 0.9

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productoCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        precio: producto.precio,
        imagen: producto.imagen,
        categoria: producto.categoria
      }

      addItem(productoCarrito, 1)
    } catch (error) {
      console.error('Error al agregar producto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-none bg-white rounded-2xl shadow-sm flex flex-col h-full">

      {/* Contenedor de Imagen */}
      <Link href={`/tienda/${producto.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#F9F9F7]">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://placehold.co/400x500/F5F5F0/4A5D45?text=${encodeURIComponent(producto.nombre)}`
          }}
        />

        {/* Badges Flotantes */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {producto.destacado && (
            <Badge className="bg-[#4A5D45] text-[#F5F5F0] border-none px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
              Destacado
            </Badge>
          )}
          {producto.stock <= 5 && producto.stock > 0 && (
            <Badge className="bg-[#A3B18A] text-white border-none px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
              Últimas unidades
            </Badge>
          )}
          {producto.stock === 0 && (
            <Badge className="bg-gray-400 text-white border-none px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
              Agotado
            </Badge>
          )}
        </div>

        {/* Overlay de Acción Rápida */}
        <div className="absolute inset-0 bg-[#3A4031]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="h-6 w-6 text-[#4A5D45]" />
          </div>
        </div>
      </Link>

      {/* Cuerpo de la Tarjeta */}
      <CardHeader className="pt-6 pb-2 px-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A3B18A]">
            {producto.categoria}
          </p>
          <Link href={`/tienda/${producto.slug}`}>
            <h3 className="font-bold text-[#3A4031] text-lg leading-tight group-hover:text-[#4A5D45] transition-colors line-clamp-1 uppercase tracking-tight">
              {producto.nombre}
            </h3>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-6 flex-grow">
        <p className="text-sm text-[#5B6350] line-clamp-2 leading-relaxed mb-4 italic">
          {producto.descripcionCorta}
        </p>
      </CardContent>

      {/* Footer con Precio y Botón */}
      <CardFooter className="px-6 pb-8 pt-0 flex flex-col gap-5">

        {/* Sección de Precios Optimizada */}
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-baseline">
            <span className="text-[9px] uppercase tracking-widest text-[#A3B18A] font-bold">Precio de lista</span>
            <span className="text-sm font-medium text-[#5B6350] line-through decoration-[#D6D6C2]">
              {formatPrice(producto.precio)}
            </span>
          </div>

          <div className="flex justify-between items-center bg-[#F9F9F7] p-2 rounded-lg border border-[#E9E9E0]/50">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-tight text-[#4A5D45] font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Transferencia
              </span>
              <span className="text-2xl font-serif font-bold text-[#4A5D45]">
                {formatPrice(precioTransferencia)}
              </span>
            </div>
            <div className="text-right">
              <Badge className="bg-[#A3B18A]/20 text-[#4A5D45] hover:bg-[#A3B18A]/20 shadow-none border-none text-[10px] font-bold px-2">
                10% OFF
              </Badge>
            </div>
          </div>
        </div>

        <div className="w-full flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || producto.stock === 0}
            className={`flex-1 rounded-xl h-11 font-bold text-xs uppercase tracking-widest transition-all
                ${producto.stock === 0
                ? 'bg-gray-100 text-gray-400'
                : 'bg-[#4A5D45] text-white hover:bg-[#3A4031] shadow-md hover:shadow-lg'}`}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>{producto.stock === 0 ? 'Sin Stock' : 'Añadir al Carrito'}</>
            )}
          </Button>

          <Link href={`/tienda/${producto.slug}`}>
            <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-[#D6D6C2] text-[#4A5D45] hover:bg-[#F5F5F0]">
              <Eye className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}