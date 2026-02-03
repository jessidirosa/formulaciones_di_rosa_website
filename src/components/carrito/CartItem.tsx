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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    setIsUpdating(true)
    try {
      updateQuantity(item.producto.id, newQuantity)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = () => {
    removeItem(item.producto.id)
  }

  return (
    <div className="flex gap-6 group py-2">
      <Link href={`/tienda/${item.producto.slug}`} className="flex-shrink-0 relative">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#F9F9F7] border border-[#E9E9E0] transition-transform group-hover:scale-105 duration-300">
          <img
            src={item.producto.imagen ?? undefined}
            alt={item.producto.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://placehold.co/100x100/F5F5F0/4A5D45?text=${encodeURIComponent(item.producto.nombre)}`
            }}
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <Link
              href={`/tienda/${item.producto.slug}`}
              className="font-bold text-[#3A4031] hover:text-[#4A5D45] transition-colors leading-tight block uppercase tracking-tight text-sm md:text-base"
            >
              {item.producto.nombre}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#A3B18A]">
                {item.producto.categoria || 'Magistral'}
              </span>
              <span className="text-[#D6D6C2]">•</span>
              <span className="text-[9px] uppercase tracking-widest text-[#5B6350] font-medium italic">
                Ref: {String(item.producto.id).split('-')[0].padStart(4, '0')}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-[#D6D6C2] hover:text-red-500 hover:bg-red-50 transition-all rounded-full h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#F9F9F7] border border-[#E9E9E0] rounded-xl overflow-hidden h-9 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.cantidad - 1)}
                disabled={isUpdating || item.cantidad <= 1}
                className="px-3 hover:bg-[#E9E9E0] text-[#4A5D45] h-full rounded-none"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <span className="px-3 text-xs font-bold text-[#3A4031] min-w-[2rem] text-center">
                {item.cantidad}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.cantidad + 1)}
                disabled={isUpdating}
                className="px-3 hover:bg-[#E9E9E0] text-[#4A5D45] h-full rounded-none"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="hidden sm:block">
              <p className="text-[9px] uppercase tracking-widest text-[#A3B18A] font-bold">Precio Unitario</p>
              <p className="text-sm font-medium text-[#5B6350]">{formatPrice(item.producto.precio)}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#A3B18A] font-bold mb-0.5">Subtotal</p>
            <div className="font-serif font-bold text-lg text-[#4A5D45]">
              {formatPrice(item.subtotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}