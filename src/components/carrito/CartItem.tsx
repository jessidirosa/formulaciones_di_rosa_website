'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/contexts/CartContext'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)

  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Manejar cambio de cantidad
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    
    setIsUpdating(true)
    try {
      updateQuantity(item.producto.id, newQuantity)
    } finally {
      setIsUpdating(false)
    }
  }

  // Remover item del carrito
  const handleRemove = () => {
    removeItem(item.producto.id)
  }

  return (
    <div className="flex gap-4">
      {/* Imagen del producto */}
      <Link href={`/tienda/${item.producto.slug}`} className="flex-shrink-0">
        <img
          src={item.producto.imagen}
          alt={item.producto.nombre}
          className="w-20 h-20 object-cover rounded-lg bg-gray-100"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://placehold.co/80x80?text=${encodeURIComponent(item.producto.nombre)}`
          }}
        />
      </Link>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link 
              href={`/tienda/${item.producto.slug}`}
              className="font-medium text-gray-900 hover:text-rose-600 transition-colors line-clamp-2"
            >
              {item.producto.nombre}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {item.producto.categoria}
            </p>
          </div>
          
          {/* Botón eliminar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 p-2"
            aria-label="Eliminar producto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Precio y controles de cantidad */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Controles de cantidad */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.cantidad - 1)}
                disabled={isUpdating || item.cantidad <= 1}
                className="px-2 h-8"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                {item.cantidad}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.cantidad + 1)}
                disabled={isUpdating || item.cantidad >= 10}
                className="px-2 h-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Precio unitario */}
            <div className="text-sm text-gray-600">
              {formatPrice(item.producto.precio)} c/u
            </div>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              {formatPrice(item.subtotal)}
            </div>
            {item.cantidad > 1 && (
              <div className="text-xs text-gray-500">
                {item.cantidad} × {formatPrice(item.producto.precio)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}