"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { FlaskConical } from "lucide-react"

export default function CategoriesMenu({
    categorias,
}: {
    categorias: { nombre: string; slug: string }[]
}) {
    const searchParams = useSearchParams()
    const categoriaActual = searchParams.get('categoria') || 'todos'

    return (
        <div className="w-full mb-10">
            {/* Título de sección sutil */}
            <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-4 h-4 text-[#A3B18A]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A]">
                    Filtrar por Especialidad
                </span>
            </div>

            {/* Contenedor con scroll horizontal para móviles */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                <Link href="/tienda" className="flex-shrink-0">
                    <Badge
                        variant="outline"
                        className={`px-6 py-2.5 cursor-pointer rounded-full transition-all duration-300 border font-bold uppercase text-[10px] tracking-widest
              ${categoriaActual === 'todos'
                                ? "bg-[#4A5D45] border-[#4A5D45] text-[#F5F5F0] shadow-md shadow-emerald-900/20"
                                : "bg-white border-[#E9E9E0] text-[#5B6350] hover:border-[#4A5D45] hover:bg-[#F9F9F7]"}`}
                    >
                        Todas
                    </Badge>
                </Link>

                {categorias.map((cat) => {
                    const isActive = categoriaActual === cat.slug
                    return (
                        <Link key={cat.slug} href={`/tienda?categoria=${cat.slug}`} className="flex-shrink-0">
                            <Badge
                                variant="outline"
                                className={`px-6 py-2.5 cursor-pointer rounded-full transition-all duration-300 border font-bold uppercase text-[10px] tracking-widest
                  ${isActive
                                        ? "bg-[#4A5D45] border-[#4A5D45] text-[#F5F5F0] shadow-md shadow-emerald-900/20"
                                        : "bg-white border-[#E9E9E0] text-[#5B6350] hover:border-[#4A5D45] hover:bg-[#F9F9F7]"}`}
                            >
                                {cat.nombre}
                            </Badge>
                        </Link>
                    )
                })}
            </div>

            {/* Estilo local para ocultar scrollbar manteniendo funcionalidad */}
            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}