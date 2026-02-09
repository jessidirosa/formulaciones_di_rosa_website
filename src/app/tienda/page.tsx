import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/productos/ProductGrid'
import ProductFilters from '@/components/productos/ProductFilters'
import { Separator } from '@/components/ui/separator'
import CategoriesMenu from "@/components/productos/CategoriesMenu"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

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
}) {
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
    let productosPorNombre: ProductoConRelaciones[] = []
    let productosPorCategoria: ProductoConRelaciones[] = []

    if (busqueda && busqueda.trim() !== '') {
      const terminos = normalizar(busqueda).split(' ').filter(t => t.length > 0)
      productosPorNombre = productosBase.filter((p) => {
        const nombreNorm = normalizar(p.nombre)
        const descNorm = normalizar(p.descripcionCorta || '')
        const catTextoNorm = normalizar((p as any).categoria || '')
        return terminos.every(term =>
          nombreNorm.includes(term) || descNorm.includes(term) || catTextoNorm.includes(term)
        )
      })
      productosPorCategoria = productosBase.filter((p) => {
        const enCategoriasRelacionadas = Array.isArray(p.categorias) &&
          p.categorias.some((pc: any) => {
            const catRelacionadaNorm = normalizar(pc.categoria.nombre)
            return terminos.some(term => catRelacionadaNorm.includes(term))
          })
        const yaEstaEnNombre = productosPorNombre.some((n) => n.id === p.id)
        return enCategoriasRelacionadas && !yaEstaEnNombre
      })
    } else {
      productosPorNombre = productosBase
    }

    const categoriasMenu = await prisma.categoria.findMany({ orderBy: { nombre: "asc" } })
    const productos = busqueda ? [...productosPorNombre, ...productosPorCategoria] : productosBase

    return { productos, categorias: categoriasMenu, productosPorNombre, productosPorCategoria }
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return { productos: [], categorias: [], productosPorNombre: [], productosPorCategoria: [] }
  }
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const params = {
    categoria: resolvedSearchParams.categoria as string,
    busqueda: resolvedSearchParams.busqueda as string,
    orden: resolvedSearchParams.orden as string,
  }

  const { productos, categorias, productosPorNombre, productosPorCategoria } = await getProductos(params)
  const mostrarAgrupado = !params.busqueda && (!params.categoria || params.categoria === 'todos')

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Barra de categorías Sticky */}
      <div className="sticky top-0 z-40 bg-[#F5F5F0]/80 backdrop-blur-md border-b border-[#D6D6C2] pt-4">
        <div className="container mx-auto px-4">
          <CategoriesMenu categorias={categorias} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 border-l-4 border-[#4A5D45] pl-6 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3A4031] mb-4 tracking-tight uppercase">
            Laboratorio Magistral
          </h1>
          <p className="text-lg text-[#5B6350] max-w-2xl leading-relaxed font-light italic text-left">
            Fórmulas exclusivas diseñadas por profesionales para potenciar tu belleza natural.
          </p>
        </div>

        <div className="mb-10">
          <Suspense fallback={<div className="animate-pulse h-20 bg-[#E9E9E0] rounded-xl"></div>}>
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
            <div className="space-y-16">
              {productosPorNombre.length > 0 && (
                <div>
                  <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A3B18A] mb-8 flex items-center gap-4 text-left">
                    <span className="w-8 h-[1px] bg-[#A3B18A]"></span>
                    Resultados Directos
                  </h2>
                  <ProductGrid productos={productosPorNombre as any} />
                </div>
              )}
              {productosPorCategoria.length > 0 && (
                <div>
                  <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A3B18A] mb-8 flex items-center gap-4 text-left">
                    <span className="w-8 h-[1px] bg-[#A3B18A]"></span>
                    Líneas Sugeridas
                  </h2>
                  <ProductGrid productos={productosPorCategoria as any} />
                </div>
              )}
              {productosPorNombre.length === 0 && productosPorCategoria.length === 0 && <EmptyState />}
            </div>
          ) : (
            <div className="space-y-24">
              {mostrarAgrupado ? (
                categorias.map((cat) => {
                  const productosDeEstaCategoria = productos.filter((p) =>
                    p.categorias.some((pc) => pc.categoria.id === (cat as any).id)
                  )
                  if (productosDeEstaCategoria.length === 0) return null

                  // Limitamos a 4 productos por sección y agregamos botón "Ver más"
                  const productosAMostrar = productosDeEstaCategoria.slice(0, 4)

                  return (
                    <div key={(cat as any).id} className="space-y-10">
                      <div className="flex items-end justify-between border-b border-[#D6D6C2] pb-4">
                        <div className="text-left">
                          <h2 className="text-3xl font-serif font-bold text-[#3A4031] uppercase tracking-tight">
                            {cat.nombre}
                          </h2>
                          <p className="text-[10px] text-[#A3B18A] font-bold uppercase tracking-widest mt-1">Especialidad Di Rosa</p>
                        </div>
                        <Link href={`/tienda?categoria=${cat.slug}`}>
                          <Button variant="ghost" className="text-[#4A5D45] font-bold text-[10px] uppercase tracking-widest hover:bg-[#4A5D45] hover:text-white transition-all rounded-full px-6">
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
      <p className="text-[#5B6350] mb-8 font-light italic">Probá con otros términos o navegá por categorías.</p>
    </div>
  )
}