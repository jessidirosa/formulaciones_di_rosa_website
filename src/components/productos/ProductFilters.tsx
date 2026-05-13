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
    <div className={`space-y-6 p-6 rounded-3xl border shadow-sm transition-all duration-500 w-full overflow-hidden ${modoProActivo ? 'bg-[#3A4031] border-[#A3B18A] shadow-[#A3B18A]/10' :
      isProfesional ? 'bg-gradient-to-br from-white to-[#F0F4EF] border-[#A3B18A]' : 'bg-white border-[#E9E9E0]'
      }`}>

      {/* SECCIÓN EXCLUSIVA PARA PROFESIONALES - Mantengo tu lógica intacta */}
      {isProfesional && (
        <div className={`flex flex-col sm:flex-row items-center justify-between p-3 rounded-2xl mb-2 gap-3 transition-colors ${modoProActivo ? 'bg-[#4A5D45] border border-white/10' : 'bg-[#3A4031]'
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

      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center w-full overflow-hidden">

        {/* Buscador: Mantenemos tu diseño con el botón afuera pero con w-full ajustable */}
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md shrink-0">
          <Input
            type="text"
            placeholder={isProfesional ? "Buscar insumos o fórmulas pro..." : "¿Qué fórmula estás buscando?"}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-12 pr-10 h-12 bg-[#F9F9F7] border-[#E9E9E0] focus:ring-[#A3B18A] rounded-2xl w-full"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A3B18A]" />

          <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto shrink-0">
            {busqueda && (
              <button type="button" onClick={() => { setBusqueda(''); updateSearchParams('busqueda', ''); }} className="text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
            <Button type="submit" size="sm" className="h-8 bg-[#4A5D45] text-white rounded-xl px-4 text-xs font-bold uppercase">
              Buscar
            </Button>
          </div>
        </form>

        {/* Ordenamiento: Ahora no flota, se queda en su lugar */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-3 bg-[#F9F9F7] px-4 py-2 rounded-2xl border border-[#E9E9E0] flex-1 lg:flex-none">
            <SlidersHorizontal className="h-4 w-4 text-[#A3B18A]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B6350] whitespace-nowrap">Ordenar:</span>
            <Select
              value={ordenActual || 'destacados'}
              onValueChange={(value) => updateSearchParams('orden', value)}
            >
              <SelectTrigger className="border-none bg-transparent focus:ring-0 h-auto p-0 text-sm font-semibold text-[#3A4031] w-full lg:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="destacados">Recomendados</SelectItem>
                <SelectItem value="nombre">Orden Alfabético</SelectItem>
                <SelectItem value="precio-asc">Menor Precio</SelectItem>
                <SelectItem value="precio-desc">Mayor Precio</SelectItem>
                <SelectItem value="nuevo">Novedades</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-[#A3B18A] font-bold uppercase text-[10px]">
              <X className="h-3 w-3 mr-2" /> Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}