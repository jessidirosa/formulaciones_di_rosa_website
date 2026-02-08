import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/productos/ProductGrid'
import ProductFilters from '@/components/productos/ProductFilters'
import { Separator } from '@/components/ui/separator'
import CategoriesMenu from "@/components/productos/CategoriesMenu"

// Definimos el tipo basado en lo que devuelve la consulta de Prisma para evitar errores de 'any'
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

// 1. LÓGICA DE DATOS
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
      where.categorias = {
        some: { categoria: { slug: categoria } },
      }
    }

    const productosBase = await getProductosBase(where, orderBy);

    let productosFiltrados = productosBase
    // ✅ CORRECCIÓN DE TIPOS: Definimos los arrays con el tipo correcto
    let productosPorNombre: ProductoConRelaciones[] = []
    let productosPorCategoria: ProductoConRelaciones[] = []

    if (busqueda && busqueda.trim() !== '') {
      const terminos = normalizar(busqueda).split(' ').filter(t => t.length > 0)

      productosPorNombre = productosFiltrados.filter((p) => {
        const nombreNorm = normalizar(p.nombre)
        const descNorm = normalizar(p.descripcionCorta || '')
        return terminos.every(term => nombreNorm.includes(term) || descNorm.includes(term))
      })

      productosPorCategoria = productosFiltrados.filter((p) => {
        const enCategoriasRelacionadas = Array.isArray(p.categorias) &&
          p.categorias.some((pc: any) => {
            const catNorm = normalizar(pc.categoria.nombre)
            return terminos.some(term => catNorm.includes(term))
          })

        const yaEstaEnNombre = productosPorNombre.some((n) => n.id === p.id)
        return enCategoriasRelacionadas && !yaEstaEnNombre
      })
    } else {
      productosPorNombre = productosFiltrados
    }

    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
    })

    const productos = busqueda ? [...productosPorNombre, ...productosPorCategoria] : productosFiltrados

    return { productos, categorias, productosPorNombre, productosPorCategoria }
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return { productos: [], categorias: [], productosPorNombre: [], productosPorCategoria: [] }
  }
}

// 2. COMPONENTE PRINCIPAL
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

  const {
    productos,
    categorias,
    productosPorNombre,
    productosPorCategoria
  } = await getProductos(params)

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <CategoriesMenu categorias={categorias} />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 border-l-4 border-[#4A5D45] pl-6 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3A4031] mb-4 tracking-tight">
            Laboratorio Magistral
          </h1>
          <p className="text-lg text-[#5B6350] max-w-2xl leading-relaxed">
            Descubrí nuestra línea completa de productos exclusivos. Cosmética natural,
            cruelty free y formulaciones personalizadas diseñadas por profesionales.
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

        <div className="mb-8 flex items-center justify-between">
          <div className="text-[#5B6350] font-medium text-left">
            {productos.length > 0
              ? <><span className="text-[#4A5D45] font-bold">{productos.length}</span> productos encontrados</>
              : 'No se encontraron resultados'}

            {params.busqueda && (
              <span className="ml-2 italic text-sm text-[#A3B18A]">
                &quot;{params.busqueda}&quot;
              </span>
            )}
          </div>
        </div>

        <Suspense fallback={<TiendaSkeleton />}>
          {params.busqueda && params.busqueda.trim() !== '' ? (
            <div className="space-y-16">
              {productosPorNombre.length > 0 && (
                <div>
                  <h2 className="text-sm uppercase tracking-widest font-bold text-[#A3B18A] mb-6 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-[#A3B18A]"></span>
                    Resultados por nombre y descripción
                  </h2>
                  <ProductGrid productos={productosPorNombre as any} />
                </div>
              )}

              {productosPorCategoria.length > 0 && (
                <div>
                  <h2 className="text-sm uppercase tracking-widest font-bold text-[#A3B18A] mb-6 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-[#A3B18A]"></span>
                    Categorías relacionadas
                  </h2>
                  <ProductGrid productos={productosPorCategoria as any} />
                </div>
              )}

              {productosPorNombre.length === 0 && productosPorCategoria.length === 0 && (
                <EmptyState />
              )}
            </div>
          ) : (
            <>
              {productos.length > 0 ? (
                <ProductGrid productos={productos as any} />
              ) : (
                <EmptyState />
              )}
            </>
          )}
        </Suspense>

        <div className="mt-24 pt-12 border-t border-[#D6D6C2]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="group">
              <div className="text-[#4A5D45] text-3xl mb-4 transform group-hover:scale-110 transition-transform">🧪</div>
              <h3 className="font-bold text-[#3A4031] mb-2 uppercase text-xs tracking-widest">Formulación Magistral</h3>
              <p className="text-sm text-[#5B6350] leading-relaxed px-4">
                Personalizamos activos según la necesidad específica de tu piel.
              </p>
            </div>
            <div className="group">
              <div className="text-[#4A5D45] text-3xl mb-4 transform group-hover:scale-110 transition-transform">🌿</div>
              <h3 className="font-bold text-[#3A4031] mb-2 uppercase text-xs tracking-widest">Esencia Natural</h3>
              <p className="text-sm text-[#5B6350] leading-relaxed px-4">
                Priorizamos ingredientes de origen botánico y procesos cruelty free.
              </p>
            </div>
            <div className="group">
              <div className="text-[#4A5D45] text-3xl mb-4 transform group-hover:scale-110 transition-transform">🚚</div>
              <h3 className="font-bold text-[#3A4031] mb-2 uppercase text-xs tracking-widest">Envíos Seguros</h3>
              <p className="text-sm text-[#5B6350] leading-relaxed px-4">
                Llegamos a todo el país con embalaje protegido y sustentable.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function TiendaSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white p-4 rounded-2xl">
          <div className="bg-[#E9E9E0] aspect-square rounded-xl mb-4"></div>
          <div className="h-4 bg-[#E9E9E0] rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-[#E9E9E0] rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-[#D6D6C2]">
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-bold text-[#4A5D45] mb-4">
          No encontramos productos
        </h3>
        <p className="text-[#5B6350] mb-8 px-6">
          Intentá ajustar los filtros o usá términos más generales para encontrar lo que buscás.
        </p>
        <div className="flex flex-col items-center gap-2 text-xs text-[#A3B18A] font-bold uppercase tracking-widest">
          <span>• Verificá la ortografía</span>
          <span>• Probá términos generales</span>
          <span>• Explorá todas las categorías</span>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const categoria = resolvedSearchParams.categoria as string
  const busqueda = resolvedSearchParams.busqueda as string

  let title = 'Tienda | Laboratorio Di Rosa'
  let description = 'Cosmética magistral y natural. Productos personalizados para el cuidado de tu piel.'

  if (categoria && categoria !== 'todos') {
    title = `${categoria} | Di Rosa`
  }

  if (busqueda) {
    title = `"${busqueda}" | Di Rosa`
  }

  return { title, description }
}