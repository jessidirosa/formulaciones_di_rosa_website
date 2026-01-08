'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { ShoppingCart, Eye } from 'lucide-react'
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

  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Manejar agregar al carrito
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Evitar navegación del Link
    setIsLoading(true)
    
    try {
      // Convertir producto al formato esperado por el carrito
      const productoCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        precio: producto.precio,
        imagen: producto.imagen,
        categoria: producto.categoria
      }
      
      addItem(productoCarrito, 1)
      
      // Opcional: mostrar toast o notificación
      console.log(`✅ ${producto.nombre} agregado al carrito`)
    } catch (error) {
      console.error('Error al agregar producto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar ver detalle
  const handleViewDetail = () => {
    router.push(`/tienda/${producto.slug}`)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      {/* Imagen del producto */}
      <Link href={`/tienda/${producto.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback en caso de error en la imagen
              const target = e.target as HTMLImageElement
              target.src = `https://placehold.co/400x400?text=${encodeURIComponent(producto.nombre)}`
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {producto.destacado && (
              <Badge className="bg-rose-500 hover:bg-rose-600 text-white">
                Destacado
              </Badge>
            )}
            {producto.stock <= 5 && producto.stock > 0 && (
              <Badge variant="destructive">
                Últimas unidades
              </Badge>
            )}
            {producto.stock === 0 && (
              <Badge variant="secondary" className="bg-gray-500 text-white">
                Sin stock
              </Badge>
            )}
          </div>

          {/* Overlay con acciones (visible en hover) */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault()
                handleViewDetail()
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver detalle
            </Button>
          </div>
        </div>
      </Link>

      {/* Información del producto */}
      <CardHeader className="pb-2">
        <div className="space-y-2">
          {/* Categoría */}
          <Badge variant="outline" className="text-xs w-fit">
            {producto.categoria}
          </Badge>
          
          {/* Nombre del producto */}
          <Link href={`/tienda/${producto.slug}`}>
            <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
              {producto.nombre}
            </h3>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        {/* Descripción corta */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {producto.descripcionCorta}
        </p>
        
        {/* Precio */}
        <div className="text-2xl font-bold text-rose-600">
          {formatPrice(producto.precio)}
        </div>
      </CardContent>

      {/* Acciones */}
      <CardFooter className="pt-0 gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || producto.stock === 0}
          className="flex-1 bg-rose-600 hover:bg-rose-700"
          size="sm"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          {producto.stock === 0 ? 'Sin stock' : 'Agregar'}
        </Button>
        
        <Link href={`/tienda/${producto.slug}`} className="flex-shrink-0">
          <Button variant="outline" size="sm">
            Ver más
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}