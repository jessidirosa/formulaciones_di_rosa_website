import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/productos/ProductGrid'
import ProductFilters from '@/components/productos/ProductFilters'
import { Separator } from '@/components/ui/separator'
import CategoriesMenu from "@/components/productos/CategoriesMenu"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Search } from 'lucide-react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"


type ProductoConRelaciones = Awaited<ReturnType<typeof getProductosBase>>[number];

async function getProductosBase(where: any, orderBy: any) {
  return await prisma.producto.findMany({
    where,
    orderBy,
    include: {
      presentaciones: true,
      categorias: { include: { categoria: true } },
    },
  })
}

async function getProductos(searchParams?: {
  categoria?: string
  busqueda?: string
  orden?: string
}, userTags?: string | null) {
  try {
    const { categoria, busqueda, orden } = searchParams || {}
    const normalizar = (str: string) =>
      str ? str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : ''

    let orderBy: any = { orden: 'asc' }
    switch (orden) {
      case 'precio-asc': orderBy = { precio: 'asc' }; break
      case 'precio-desc': orderBy = { precio: 'desc' }; break
      case 'nombre': orderBy = { nombre: 'asc' }; break
      case 'nuevo': orderBy = { creadoEn: 'desc' }; break
      default: orderBy = [{ destacado: 'desc' }, { orden: 'asc' }]
    }

    const where: any = { activo: true }
    if (categoria && categoria !== "todos") {
      where.categorias = { some: { categoria: { slug: categoria } } }
    }

    const productosBase = await getProductosBase(where, orderBy);
    let productos: any[] = [];
    let productosPorNombre: any[] = [];
    let productosPorOtros: any[] = [];

    // ✅ BUSQUEDA CON JERARQUÍA: Nombre > Descripción > Categoría
    if (busqueda && busqueda.trim() !== '') {
      const terminos = normalizar(busqueda).split(' ').filter(t => t.length > 0)

      // 1. Filtrar por Nombre (Prioridad máxima)
      const resultadosNombreBase = productosBase.filter((p) => {
        const nombreNorm = normalizar(p.nombre)
        return terminos.every(term => nombreNorm.includes(term))
      })

      // Separamos los resultados de nombre por categoría
      const nombresPublico = resultadosNombreBase.filter(p =>
        !p.categorias.some((pc: any) => pc.categoria.slug === 'uso-profesional')
      )
      const nombresProfesional = resultadosNombreBase.filter(p =>
        p.categorias.some((pc: any) => pc.categoria.slug === 'uso-profesional')
      )

      // Si el usuario es PRO, mantenemos el orden normal (o mezclado). 
      // Si NO es PRO (o no hay sesión), mandamos los nombres profesionales al final del bloque de nombres.
      if (userTags === 'PROFESIONAL') {
        productosPorNombre = [...nombresProfesional, ...nombresPublico] // Prioridad al stock pro para el pro
      } else {
        productosPorNombre = [...nombresPublico, ...nombresProfesional] // Prioridad al stock público para el resto
      }


      // --- 2. PRIORIDAD: TODO LO DEMÁS (Descripción + Categoría Texto + Categorías DB) ---
      productosPorOtros = productosBase.filter((p) => {
        // Evitamos duplicar lo que ya encontramos por nombre
        const yaEstaEnNombre = productosPorNombre.some(n => n.id === p.id)
        if (yaEstaEnNombre) return false

        const descNorm = normalizar(p.descripcionCorta || '')
        const catTextoNorm = normalizar(p.categoria || '') // El campo "categoria" de texto

        // Revisamos las categorías vinculadas de la tienda
        const enCategoriasTienda = p.categorias.some((pc: any) =>
          normalizar(pc.categoria.nombre).includes(normalizar(busqueda))
        )

        // Verificamos si los términos de búsqueda están en alguno de esos campos
        const coincideDescripcion = terminos.every(term => descNorm.includes(term))
        const coincideCatTexto = terminos.every(term => catTextoNorm.includes(term))

        return coincideDescripcion || coincideCatTexto || enCategoriasTienda
      })

      // Unificamos todo en una sola lista respetando el orden de relevancia
      productos = [...productosPorNombre, ...productosPorOtros]

    } else {
      // ✅ Si no hay búsqueda, mostramos todo el catálogo base
      productosPorNombre = productosBase
      productos = productosBase
    }

    const categoriasMenu = await prisma.categoria.findMany({ orderBy: { nombre: "asc" } })

    return { productos, categorias: categoriasMenu, productosPorNombre, productosPorOtros }
  } catch (error) {
    console.error(error)
    return { productos: [], categorias: [], productosPorNombre: [], productosPorOtros: [] }
  }
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

  const session = await getServerSession(authOptions)
  const userTags = (session?.user as any)?.tags // Obtenemos el tag (PROFESIONAL o null)
  const resolvedSearchParams = await searchParams
  const params = {
    categoria: resolvedSearchParams.categoria as string,
    busqueda: resolvedSearchParams.busqueda as string,
    orden: resolvedSearchParams.orden as string,
  }

  const { productos, categorias, productosPorNombre, productosPorOtros } = await getProductos(params, userTags)

  // ✅ LOGICA DE REORDENAMIENTO PARA PROFESIONALES
  let categoriasOrdenadas = [...categorias]
  if (userTags === 'PROFESIONAL') {
    // Buscamos la categoría profesional y la ponemos al principio
    const indicePro = categoriasOrdenadas.findIndex(c => c.slug === 'uso-profesional')
    if (indicePro > -1) {
      const [categoriaPro] = categoriasOrdenadas.splice(indicePro, 1)
      categoriasOrdenadas.unshift(categoriaPro)
    }
  }

  const mostrarAgrupado = !params.busqueda && (!params.categoria || params.categoria === 'todos')

  const nombreCategoriaActual = categorias.find(c => c.slug === params.categoria)?.nombre

  return (
    <div className="min-h-screen bg-[#F5F5F0] relative">
      {/* ✅ BARRA STICKY CORREGIDA: z-[100] para estar sobre todo, top-0 o top-[altura-header] si tenés header fijo */}
      {/* ✅ Barra Sticky Corregida para Móvil */}
      <div className="sticky top-0 z-[100] bg-[#F5F5F0]/80 backdrop-blur-md border-b border-[#D6D6C2] py-2 w-full shadow-sm">
        <div className="container mx-auto px-2 md:px-4 max-w-7xl">
          <CategoriesMenu categorias={categorias} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl relative">
        {/* Título adaptado */}
        <div className="mb-8 border-l-4 border-[#4A5D45] pl-4 md:pl-6 text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-[#3A4031] mb-2 tracking-tight uppercase leading-none">
            Laboratorio Magistral
          </h1>
          <p className="text-sm md:text-lg text-[#5B6350] max-w-2xl font-light italic">
            Fórmulas exclusivas diseñadas por profesionales para potenciar tu belleza natural.
          </p>
        </div>

        <div className="mb-10 text-left space-y-4">
          {params.categoria && params.categoria !== 'todos' && (
            <div className="flex items-center gap-2 text-[#4A5D45] bg-[#A3B18A]/10 w-fit px-4 py-2 rounded-full border border-[#A3B18A]/20 animate-in fade-in slide-in-from-top-2 duration-500">
              <Search className="w-3 h-3" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Estás en la categoría: <span className="underline decoration-2 underline-offset-4">{nombreCategoriaActual}</span>
              </span>
            </div>
          )}

          <Suspense fallback={<div className="h-20 bg-[#E9E9E0] animate-pulse rounded-2xl" />}>
            <ProductFilters
              categorias={categorias}
              categoriaActual={params.categoria}
              busquedaActual={params.busqueda}
              ordenActual={params.orden}
            />
          </Suspense>
        </div>

        <Separator className="mb-10 bg-[#D6D6C2]" />

        <Suspense fallback={<TiendaSkeleton />}>
          {params.busqueda && params.busqueda.trim() !== '' ? (
            <div className="space-y-10">
              {productos.length > 0 ? (
                <div>
                  <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A3B18A] mb-8 flex items-center gap-4 text-left">
                    <span className="w-8 h-[1px] bg-[#A3B18A]"></span>
                    Resultados para: {params.busqueda}
                  </h2>
                  <ProductGrid productos={productos as any} />
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          ) : (
            <div className="space-y-24">
              {mostrarAgrupado ? (
                categoriasOrdenadas.map((cat) => { // 👈 Usamos la lista reordenada
                  const productosDeEstaCategoria = productos.filter((p) =>
                    p.categorias.some((pc: any) => pc.categoria.id === (cat as any).id)
                  )

                  // ✅ Si es profesional, podemos mostrar 8 productos en lugar de 4 
                  // en su categoría específica para que encuentre todo más rápido
                  const esCatPro = cat.slug === 'uso-profesional'
                  const limite = esCatPro && userTags === 'PROFESIONAL' ? 8 : 4
                  const productosAMostrar = productosDeEstaCategoria.slice(0, limite)

                  if (productosDeEstaCategoria.length === 0) return null


                  return (
                    <div key={(cat as any).id} className={`space-y-10 ${esCatPro && userTags === 'PROFESIONAL' ? 'bg-[#4A5D45]/5 p-8 rounded-[3rem] border border-[#4A5D45]/10' : ''}`}>
                      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D6D6C2] pb-4 gap-4">
                        <div className="text-left">
                          <h2 className="text-3xl font-serif font-bold text-[#3A4031] uppercase tracking-tight flex items-center gap-3">
                            {cat.nombre}
                            {esCatPro && <span className="text-[9px] bg-[#4A5D45] text-white px-2 py-1 rounded-full">Exclusivo Pro</span>}
                          </h2>
                          <p className="text-[10px] text-[#A3B18A] font-bold uppercase tracking-widest mt-1 text-left">
                            {esCatPro ? "Tu línea de gabinete con precio preferencial" : "Especialidad Di Rosa"}
                          </p>
                        </div>
                        <Link href={`/tienda?categoria=${cat.slug}`} className="w-fit">
                          <Button variant="ghost" className="text-[#4A5D45] font-bold text-[10px] uppercase tracking-widest hover:bg-[#4A5D45] hover:text-white transition-all rounded-full px-6 border border-[#4A5D45]/10 md:border-none">
                            Ver línea completa <ArrowRight className="ml-2 w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                      <ProductGrid productos={productosAMostrar as any} />
                    </div>
                  )
                })
              ) : (
                <ProductGrid productos={productos as any} />
              )}
            </div>
          )}
        </Suspense>
      </main>
    </div>
  )
}

function TiendaSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white p-4 rounded-2xl">
          <div className="bg-[#E9E9E0] aspect-square rounded-xl mb-4"></div>
          <div className="h-4 bg-[#E9E9E0] rounded w-3/4 mb-2"></div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24 bg-white/50 rounded-[3rem] border-2 border-dashed border-[#D6D6C2]">
      <h3 className="text-xl font-bold text-[#4A5D45] mb-2 uppercase tracking-tighter">Sin resultados</h3>
      <p className="text-[#5B6350] mb-8 font-light italic text-center">Probá con otros términos o navegá por categorías.</p>
    </div>
  )
}