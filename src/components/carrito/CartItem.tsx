'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { Minus, Plus, Trash2, MessageSquareText } from 'lucide-react'
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
      // ✅ PASAMOS LAS NOTAS AQUÍ TAMBIÉN
      updateQuantity(item.producto.id, newQuantity, item.producto.notasPersonalizadas)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = () => {
    // ✅ PASAMOS AMBOS: El ID y las Notas para que el filtro sea exacto
    removeItem(item.producto.id, item.producto.notasPersonalizadas)
  }

  return (
    // Agregamos relative y pr-10 para dejar espacio al tachito
    <div className="flex gap-4 md:gap-6 group py-2 relative pr-10">

      {/* BOTÓN ELIMINAR MEJORADO: Posición absoluta para que no se tape */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeItem(item.producto.id, item.producto.notasPersonalizadas)}
        className="absolute top-2 right-2 text-[#D6D6C2] hover:text-red-500 hover:bg-red-50 transition-all rounded-full h-9 w-9 p-0 z-50 shadow-sm"
        title="Eliminar de mi selección"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Link href={`/tienda/${item.producto.slug}`} className="flex-shrink-0">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-[#F9F9F7] border border-[#E9E9E0]">
          <img
            src={item.producto.imagen ?? undefined}
            alt={item.producto.nombre}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-1 text-left">
          <Link
            href={`/tienda/${item.producto.slug}`}
            className="font-bold text-[#3A4031] hover:text-[#4A5D45] transition-colors leading-tight block uppercase tracking-tight text-xs md:text-sm pr-4"
          >
            {item.producto.nombre}
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#A3B18A]">
              {item.producto.categoria}
            </span>
          </div>

          {item.producto.notasPersonalizadas && (
            <div className="mt-1 flex items-start gap-2 bg-[#F5F5F0] p-1.5 rounded-lg border border-[#E9E9E0]/50 max-w-[90%]">
              <MessageSquareText className="h-3 w-3 text-[#4A5D45] mt-0.5 flex-shrink-0" />
              <p className="text-[9px] text-[#5B6350] leading-tight italic line-clamp-2">
                "{item.producto.notasPersonalizadas}"
              </p>
            </div>
          )}
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
    </div >
  )
}