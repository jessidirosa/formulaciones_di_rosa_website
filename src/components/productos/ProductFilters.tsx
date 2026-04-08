'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, SlidersHorizontal, Sparkles, Award } from 'lucide-react'

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
  const { user } = useUser() // ✅ Obtenemos el usuario
  const [busqueda, setBusqueda] = useState(busquedaActual || '')

  const isProfesional = user?.tags === 'PROFESIONAL'
  // ✅ Detectamos si el "Modo Pro" está activo actualmente
  const modoProActivo = categoriaActual === 'uso-profesional'

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

  // ✅ Modificado: Al buscar, eliminamos la categoría para buscar en todo el sitio
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (busqueda) {
      params.set('busqueda', busqueda)
      if (!modoProActivo) {
        params.delete('categoria')
      }
    } else {
      params.delete('busqueda')
    }

    router.push(`/tienda?${params.toString()}`)
  };

  const clearFilters = () => {
    setBusqueda('')
    router.push('/tienda')
  }

  const toggleModoPro = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (modoProActivo) {
      params.delete('categoria')
      params.delete('busqueda')
      setBusqueda('')
    } else {
      params.set('categoria', 'uso-profesional')
    }
    router.push(`/tienda?${params.toString()}`)
  }


  const hasActiveFilters =
    busquedaActual ||
    (ordenActual && ordenActual !== 'destacados')

  return (
    <div className={`space-y-6 p-6 rounded-3xl border shadow-sm transition-all duration-500 ${modoProActivo ? 'bg-[#3A4031] border-[#A3B18A] shadow-[#A3B18A]/10' :
      isProfesional ? 'bg-gradient-to-br from-white to-[#F0F4EF] border-[#A3B18A]' : 'bg-white border-[#E9E9E0]'
      }`}>

      {/* SECCIÓN EXCLUSIVA PARA PROFESIONALES */}
      {isProfesional && (
        <div className={`flex items-center justify-between p-3 rounded-2xl mb-2 transition-colors ${modoProActivo ? 'bg-[#4A5D45] border border-white/10' : 'bg-[#3A4031]'
          }`}>
          <div className="flex items-center gap-3 pl-2">
            <div className={`${modoProActivo ? 'bg-white text-[#4A5D45]' : 'bg-[#A3B18A] text-white'} p-1.5 rounded-full`}>
              <Award className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              {modoProActivo ? 'Vista Profesional Activada' : 'Filtros de Gabinete'}
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={toggleModoPro}
            className={`h-8 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${modoProActivo
              ? 'bg-red-500/20 text-red-200 hover:bg-red-500 hover:text-white'
              : 'text-[#A3B18A] hover:bg-white/10'
              }`}
          >
            {modoProActivo ? (
              <><X className="w-3 h-3 mr-2" /> Salir de Línea Profesional</>
            ) : (
              <><Sparkles className="w-3 h-3 mr-2" /> Activar Catálogo Profesional</>
            )}
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">

        {/* Buscador de Productos */}
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md group">
          <Input
            type="text"
            placeholder={isProfesional ? "Buscar insumos o fórmulas pro..." : "¿Qué fórmula estás buscando?"}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-12 pr-10 h-12 bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] rounded-2xl transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A3B18A] group-focus-within:text-[#4A5D45] transition-colors" />
          {busqueda && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                updateSearchParams('busqueda', '')
              }}
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
    </div>
  )
}