'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, SlidersHorizontal } from 'lucide-react'

type ProductFiltersProps = {
  categorias: { nombre: string; slug: string }[]
  categoriaActual?: string
  busquedaActual?: string
  ordenActual?: string
}

export default function ProductFilters({
  categorias,
  categoriaActual,
  busquedaActual,
  ordenActual,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [busqueda, setBusqueda] = useState(busquedaActual || '')

  useEffect(() => {
    setBusqueda(busquedaActual || '')
  }, [busquedaActual])

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'todos') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/tienda?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams('busqueda', busqueda)
  }

  const clearFilters = () => {
    setBusqueda('')
    router.push('/tienda')
  }

  // ✅ Solo mostramos "Limpiar" si hay búsqueda o un orden que no sea el de por defecto
  const hasActiveFilters =
    busquedaActual ||
    (ordenActual && ordenActual !== 'destacados')

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-[#E9E9E0] shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">

        {/* Buscador de Productos */}
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md group">
          <Input
            type="text"
            placeholder="¿Qué fórmula estás buscando?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-12 pr-10 h-12 bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] rounded-2xl transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A3B18A] group-focus-within:text-[#4A5D45] transition-colors" />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 bg-[#4A5D45] hover:bg-[#3D4C39] text-white rounded-xl px-4 text-xs font-bold uppercase tracking-widest"
          >
            Buscar
          </Button>
        </form>

        {/* Controles de Ordenamiento */}
        <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
          <div className="flex items-center gap-3 bg-[#F9F9F7] px-4 py-2 rounded-2xl border border-[#E9E9E0]">
            <SlidersHorizontal className="h-4 w-4 text-[#A3B18A]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B6350]">Ordenar:</span>
            <Select
              value={ordenActual || 'destacados'}
              onValueChange={(value) => updateSearchParams('orden', value)}
            >
              <SelectTrigger className="border-none bg-transparent focus:ring-0 h-auto p-0 text-sm font-semibold text-[#3A4031] w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#E9E9E0]">
                <SelectItem value="destacados">Recomendados</SelectItem>
                <SelectItem value="nombre">Orden Alfabético</SelectItem>
                <SelectItem value="precio-asc">Menor Precio</SelectItem>
                <SelectItem value="precio-desc">Mayor Precio</SelectItem>
                <SelectItem value="nuevo">Novedades</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-[#A3B18A] hover:text-red-500 hover:bg-red-50 font-bold uppercase text-[10px] tracking-widest"
            >
              <X className="h-3 w-3 mr-2" />
              Limpiar Todo
            </Button>
          )}
        </div>
      </div>

      {/* ✅ Se eliminó toda la sección de "Chips de Filtros Activos" que mostraba el tag de Especialidad */}
    </div>
  )
}

function getOrderLabel(orden: string): string {
  switch (orden) {
    case 'nombre': return 'Nombre A-Z'
    case 'precio-asc': return 'Precio ↑'
    case 'precio-desc': return 'Precio ↓'
    case 'nuevo': return 'Más recientes'
    default: return 'Recomendados'
  }
}