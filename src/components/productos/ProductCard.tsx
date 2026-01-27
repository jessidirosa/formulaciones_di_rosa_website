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
import { Loader2 } from "lucide-react" // Para el icono de carga

interface Presentacion {
  id: number
  nombre: string
  precio: number
  stock: number
}

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
  presentaciones?: Presentacion[]
}

interface ProductCardProps {
  producto: Producto
}

export default function ProductCard({ producto }: ProductCardProps) {
  const { addItem } = useCart()
  const { isAuthenticated } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const tienePresentaciones = producto.presentaciones && producto.presentaciones.length > 0
  const precioBase = tienePresentaciones
    ? Math.min(...producto.presentaciones!.map(p => p.precio))
    : producto.precio

  const stockTotal = tienePresentaciones
    ? producto.presentaciones!.reduce((acc, p) => acc + p.stock, 0)
    : (producto.stock || 0)

  const precioTransferencia = precioBase * 0.9

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (tienePresentaciones) {
      router.push(`/tienda/${producto.slug}`)
      return
    }

    setIsLoading(true)
    try {
      const productoCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        precio: precioBase,
        imagen: producto.imagen,
        categoria: producto.categoria
      }
      addItem(productoCarrito as any, 1)
    } catch (error) {
      console.error('Error al agregar producto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-none bg-white rounded-2xl shadow-sm flex flex-col h-full max-w-sm mx-auto w-full">
      <Link href={`/tienda/${producto.slug}`} className="relative block aspect-square overflow-hidden bg-[#F9F9F7]">
        <img
          src={producto.imagen || '/images/placeholder-producto.jpg'}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://placehold.co/400x500/F5F5F0/4A5D45?text=${encodeURIComponent(producto.nombre)}`
          }}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {producto.destacado && (
            <Badge className="bg-[#4A5D45] text-[#F5F5F0] border-none px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-bold">
              Destacado
            </Badge>
          )}
          {stockTotal <= 5 && stockTotal > 0 && (
            <Badge className="bg-[#A3B18A] text-white border-none px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-bold">
              Últimas unidades
            </Badge>
          )}
          {stockTotal === 0 && (
            <Badge className="bg-gray-400 text-white border-none px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-bold">
              Agotado
            </Badge>
          )}
        </div>
      </Link>

      <CardHeader className="pt-4 pb-1 px-5">
        <div className="space-y-0.5">
          <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#A3B18A]">
            {producto.categoria || 'Cosmética Magistral'}
          </p>
          <Link href={`/tienda/${producto.slug}`}>
            <h3 className="font-bold text-[#3A4031] text-base leading-tight group-hover:text-[#4A5D45] transition-colors line-clamp-1 uppercase tracking-tight">
              {producto.nombre}
            </h3>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2 flex-grow">
        <p className="text-xs text-[#5B6350] line-clamp-2 leading-snug italic">
          {producto.descripcionCorta}
        </p>
      </CardContent>

      <CardFooter className="px-5 pb-6 pt-2 flex flex-col gap-4">
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-baseline px-1">
            <span className="text-[8px] uppercase tracking-widest text-[#A3B18A] font-bold">
              {tienePresentaciones ? 'Desde' : 'Precio de lista'}
            </span>
            <span className="text-xs font-medium text-[#5B6350] line-through decoration-[#D6D6C2]">
              {formatPrice(precioBase)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-[#F9F9F7] p-2.5 rounded-xl border border-[#E9E9E0]/50">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-tight text-[#4A5D45] font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Transferencia
              </span>
              <span className="text-xl font-serif font-bold text-[#4A5D45]">
                {formatPrice(precioTransferencia)}
              </span>
            </div>
            <div className="text-right">
              <Badge className="bg-[#A3B18A]/20 text-[#4A5D45] hover:bg-[#A3B18A]/20 shadow-none border-none text-[9px] font-bold px-1.5">
                10% OFF
              </Badge>
            </div>
          </div>
        </div>
        <div className="w-full flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || stockTotal === 0}
            className={`flex-1 rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest transition-all
                ${stockTotal === 0 ? 'bg-gray-100 text-gray-400' : 'bg-[#4A5D45] text-white hover:bg-[#3A4031]'}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>{stockTotal === 0 ? 'Sin Stock' : tienePresentaciones ? 'Ver Opciones' : 'Añadir'}</>
            )}
          </Button>
          <Link href={`/tienda/${producto.slug}`}>
            <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-[#D6D6C2] text-[#4A5D45] hover:bg-[#F5F5F0]">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}