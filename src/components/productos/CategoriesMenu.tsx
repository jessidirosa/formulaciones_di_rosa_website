"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, ChevronLeft, ChevronRight } from "lucide-react"

export default function CategoriesMenu({
    categorias,
}: {
    categorias: { nombre: string; slug: string }[]
}) {
    const searchParams = useSearchParams()
    const categoriaActual = searchParams.get('categoria') || 'todos'
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const checkArrows = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeftArrow(scrollLeft > 10)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    useEffect(() => {
        const currentRef = scrollRef.current
        if (currentRef) {
            currentRef.addEventListener("scroll", checkArrows)
            checkArrows()
            window.addEventListener("resize", checkArrows)
        }
        return () => {
            if (currentRef) currentRef.removeEventListener("scroll", checkArrows)
            window.removeEventListener("resize", checkArrows)
        }
    }, [categorias])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 250
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            })
        }
    }

    return (
        <div className="w-full max-w-full mb-10 text-left overflow-hidden">
            {/* Título de sección sutil */}
            <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-4 h-4 text-[#A3B18A]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A]">
                    Filtrar por Especialidad
                </span>
            </div>

            <div className="relative group max-w-full">
                {/* Flecha Izquierda */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md border border-[#E9E9E0] p-1.5 rounded-full shadow-lg text-[#4A5D45] hover:bg-[#4A5D45] hover:text-white transition-all hidden md:flex"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}

                {/* Contenedor con scroll horizontal - Corregido para no desbordar */}
                <div
                    ref={scrollRef}
                    className="flex items-center gap-3 overflow-x-auto pb-4 px-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full"
                >
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

                {/* Flecha Derecha */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md border border-[#E9E9E0] p-1.5 rounded-full shadow-lg text-[#4A5D45] hover:bg-[#4A5D45] hover:text-white transition-all hidden md:flex"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}

                {/* Degradados laterales */}
                <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#F5F5F0] to-transparent pointer-events-none z-10 hidden md:block opacity-60" />
            </div>
        </div>
    )
}