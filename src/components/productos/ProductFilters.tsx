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
import { Search, X } from 'lucide-react'

type ProductFiltersProps = {
  categorias: { nombre: string; slug: string }[] // la prop sigue por si la queremos usar después
  categoriaActual?: string
  busquedaActual?: string
  ordenActual?: string
}

export default function ProductFilters({
  categorias,        // ahora no la usamos, pero la dejamos por compatibilidad
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

  const hasActiveFilters =
    categoriaActual ||
    busquedaActual ||
    (ordenActual && ordenActual !== 'destacados')

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pr-10"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Filtros (solo orden) */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Filtro por orden */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
          <Select
            value={ordenActual || 'destacados'}
            onValueChange={(value) => updateSearchParams('orden', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="destacados">Destacados</SelectItem>
              <SelectItem value="nombre">Nombre A-Z</SelectItem>
              <SelectItem value="precio-asc">Precio menor a mayor</SelectItem>
              <SelectItem value="precio-desc">Precio mayor a menor</SelectItem>
              <SelectItem value="nuevo">Más recientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tags de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {categoriaActual && categoriaActual !== 'todos' && (
            <Badge variant="secondary" className="gap-1">
              Categoría: {categoriaActual}
              <button
                onClick={() => updateSearchParams('categoria', '')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {busquedaActual && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: &quot;{busquedaActual}&quot;
              <button
                onClick={() => {
                  setBusqueda('')
                  updateSearchParams('busqueda', '')
                }}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {ordenActual && ordenActual !== 'destacados' && (
            <Badge variant="secondary" className="gap-1">
              Orden: {getOrderLabel(ordenActual)}
              <button
                onClick={() => updateSearchParams('orden', '')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

function getOrderLabel(orden: string): string {
  switch (orden) {
    case 'nombre':
      return 'Nombre A-Z'
    case 'precio-asc':
      return 'Precio ↑'
    case 'precio-desc':
      return 'Precio ↓'
    case 'nuevo':
      return 'Más recientes'
    default:
      return 'Destacados'
  }
}
