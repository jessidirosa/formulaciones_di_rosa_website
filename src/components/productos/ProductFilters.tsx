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
    // Si el usuario borra todo, limpiamos la búsqueda en la URL
    if (busqueda === "" && busquedaActual) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('busqueda');
      router.push(`/tienda?${params.toString()}`, { scroll: false });
      return;
    }

    // Si lo que escribió es igual a lo que ya está en la URL, no hacemos nada
    if (busqueda === (busquedaActual || '')) return;

    // Timer para esperar a que deje de escribir (400ms)
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (busqueda) {
        params.set('busqueda', busqueda);
        // Si no es modo pro, buscamos en todo para no limitar resultados
        if (!modoProActivo) params.delete('categoria');
      } else {
        params.delete('busqueda');
      }

      router.push(`/tienda?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, modoProActivo, busquedaActual, router, searchParams]);

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
    e.preventDefault();
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
    <div className={`space-y-4 md:space-y-6 p-4 md:p-6 rounded-[2rem] md:rounded-3xl border shadow-sm transition-all duration-500 ${modoProActivo ? 'bg-[#3A4031] border-[#A3B18A] shadow-[#A3B18A]/10' :
        isProfesional ? 'bg-gradient-to-br from-white to-[#F0F4EF] border-[#A3B18A]' : 'bg-white border-[#E9E9E0]'
      }`}>

      {/* SECCIÓN EXCLUSIVA PARA PROFESIONALES - Adaptada para móvil */}
      {isProfesional && (
        <div className={`flex flex-col sm:flex-row items-center justify-between p-3 rounded-2xl gap-3 transition-colors ${modoProActivo ? 'bg-[#4A5D45] border border-white/10' : 'bg-[#3A4031]'
          }`}>
          <div className="flex items-center gap-3">
            <div className={`${modoProActivo ? 'bg-white text-[#4A5D45]' : 'bg-[#A3B18A] text-white'} p-1.5 rounded-full`}>
              <Award className="h-4 w-4" />
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em]">
              {modoProActivo ? 'Vista Profesional Activada' : 'Filtros de Gabinete'}
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={toggleModoPro}
            className={`h-8 w-full sm:w-auto rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${modoProActivo
                ? 'bg-red-500/20 text-red-200 hover:bg-red-500 hover:text-white'
                : 'text-[#A3B18A] hover:bg-white/10 border border-white/10 sm:border-none'
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

      {/* Buscador y Ordenamiento: En columna para móvil, en fila para desktop */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 justify-between items-stretch lg:items-center">

        {/* Buscador de Productos */}
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md group">
          <Input
            type="text"
            placeholder={isProfesional ? "Buscar insumos pro..." : "¿Qué fórmula buscas?"}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-11 pr-24 h-11 md:h-12 bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] focus:border-[#A3B18A] rounded-2xl text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[#A3B18A] group-focus-within:text-[#4A5D45] transition-colors" />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {busqueda && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('')
                  updateSearchParams('busqueda', '')
                }}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-8 bg-[#4A5D45] hover:bg-[#3D4C39] text-white rounded-xl px-3 text-[10px] font-bold uppercase tracking-widest"
            >
              Buscar
            </Button>
          </div>
        </form>

        {/* Controles de Ordenamiento y Limpieza */}
        <div className="flex items-center justify-between lg:justify-end gap-2 md:gap-4">
          <div className="flex flex-1 lg:flex-none items-center gap-2 md:gap-3 bg-[#F9F9F7] px-3 md:px-4 py-2 rounded-2xl border border-[#E9E9E0]">
            <SlidersHorizontal className="h-3 w-3 md:h-4 md:w-4 text-[#A3B18A]" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#5B6350] whitespace-nowrap">Ordenar:</span>
            <Select
              value={ordenActual || 'destacados'}
              onValueChange={(value) => updateSearchParams('orden', value)}
            >
              <SelectTrigger className="border-none bg-transparent focus:ring-0 h-auto p-0 text-xs md:text-sm font-semibold text-[#3A4031] min-w-[100px] md:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#E9E9E0]">
                <SelectItem value="destacados">Recomendados</SelectItem>
                <SelectItem value="nombre">Alfabeto</SelectItem>
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
              className="text-[#A3B18A] hover:text-red-500 hover:bg-red-50 font-bold uppercase text-[9px] md:text-[10px] tracking-widest px-2"
            >
              <X className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">Limpiar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}