import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/productos/ProductGrid'
import ProductFilters from '@/components/productos/ProductFilters'
import { Separator } from '@/components/ui/separator'
import CategoriesMenu from "@/components/productos/CategoriesMenu"


// Obtener productos de la base de datos
// Esta función obtiene los productos de la base de datos
async function getProductos(searchParams?: {
  categoria?: string
  busqueda?: string
  orden?: string
}) {
  try {
    const { categoria, busqueda, orden } = searchParams || {}

    // Función para normalizar (minúsculas + sin acentos)
    const normalizar = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita tildes

    // Configurar ordenamiento básico
    let orderBy: any = { orden: 'asc' }

    switch (orden) {
      case 'precio-asc':
        orderBy = { precio: 'asc' }
        break
      case 'precio-desc':
        orderBy = { precio: 'desc' }
        break
      case 'nombre':
        orderBy = { nombre: 'asc' }
        break
      case 'nuevo':
        orderBy = { creadoEn: 'desc' }
        break
      default:
        orderBy = [{ destacado: 'desc' }, { orden: 'asc' }]
    }


    const where: any = {
      activo: true,
    }

    if (categoria && categoria !== "todos") {
      where.categorias = {
        some: {
          categoria: {
            slug: categoria,   // coincide con slug desde el home
          },
        },
      }
    }
    // Traemos todos los productos activos y después filtramos en JS
    // Traemos todos los productos activos, con el orden elegido
    const productosBase = await prisma.producto.findMany({
      where,
      orderBy,
      include: {
        categorias: {
          include: {
            categoria: true,  // trae { categoria: { id, nombre, slug, ... } }
          },
        },
      },
    })



    // Filtrado por categoría (parámetro de la URL)
    let productosFiltrados = productosBase

    // Si hay búsqueda, separamos en:
    // - productosPorNombre: matchean en nombre
    // - productosPorCategoria: matchean en categoría
    let productosPorNombre = productosFiltrados
    let productosPorCategoria: typeof productosFiltrados = []

    if (busqueda && busqueda.trim() !== '') {
      const term = normalizar(busqueda)

      productosPorNombre = productosFiltrados.filter((p) =>
        normalizar(p.nombre).includes(term)
      )

      productosPorCategoria = productosFiltrados.filter((p: any) => {
        // Texto suelto 'categoria' del producto (si lo usás)
        const enCategoriaPrincipal =
          p.categoria ? normalizar(p.categoria).includes(term) : false

        // Categorías reales (tabla Categoria)
        const enCategoriasRelacionadas =
          Array.isArray(p.categorias) &&
          p.categorias.some((pc: any) =>
            normalizar(pc.categoria.nombre).includes(term)
          )

        const yaEstaEnNombre = productosPorNombre.some((n) => n.id === p.id)

        return (enCategoriaPrincipal || enCategoriasRelacionadas) && !yaEstaEnNombre
      })

    }

    // Categorías disponibles (para los filtros)
    const categorias = await prisma.categoria.findMany({
      select: {
        nombre: true,
        slug: true,
      },
      orderBy: { nombre: "asc" },
    })


    // Este array lo seguimos usando para el contador y para cuando no hay búsqueda
    const productos = busqueda ? [...productosPorNombre, ...productosPorCategoria] : productosFiltrados

    return {
      productos,
      categorias,
      productosPorNombre,
      productosPorCategoria
    }
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return {
      productos: [],
      categorias: [],
      productosPorNombre: [],
      productosPorCategoria: []
    }
  }
}


export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  // Normalizar parámetros
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
    <div className="container mx-auto px-4 py-8">
      {/* Header de la tienda */}
      <CategoriesMenu categorias={categorias} />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tienda Formulaciones Di Rosa
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Descubrí nuestra línea completa de productos magistrales. Cosmética natural,
          cruelty free y formulada especialmente para el cuidado de tu piel.
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-8">
        <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded"></div>}>
          <ProductFilters
            categorias={categorias}
            categoriaActual={params.categoria}
            busquedaActual={params.busqueda}
            ordenActual={params.orden}
          />
        </Suspense>
      </div>

      <Separator className="mb-8" />

      {/* Resultados */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {productos.length > 0
              ? `${productos.length} producto${productos.length !== 1 ? 's' : ''} encontrado${productos.length !== 1 ? 's' : ''}`
              : 'No se encontraron productos'}
            {params.categoria && params.categoria !== 'todos' && (
              <span className="ml-2">
                en <strong>{params.categoria}</strong>
              </span>
            )}
            {params.busqueda && (
              <span className="ml-2">
                para <strong>&quot;{params.busqueda}&quot;</strong>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Grid de productos */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        }
      >
        {params.busqueda && params.busqueda.trim() !== '' ? (
          <div className="space-y-10">
            {productosPorNombre.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Resultados en nombres de productos
                </h2>
                <ProductGrid productos={productosPorNombre as any} />
              </div>
            )}

            {productosPorCategoria.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Productos en categorías relacionadas
                </h2>
                <ProductGrid productos={productosPorCategoria as any} />
              </div>
            )}

            {productosPorNombre.length === 0 &&
              productosPorCategoria.length === 0 && (
                <p className="text-gray-600">
                  No se encontraron productos que coincidan con la búsqueda.
                </p>
              )}
          </div>
        ) : (
          <ProductGrid productos={productos as any} />
        )}
      </Suspense>


      {/* Mensaje de productos vacío */}
      {productos.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              Intentá cambiar los filtros o realizar una nueva búsqueda.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Verificá la ortografía de tu búsqueda</p>
              <p>• Probá con términos más generales</p>
              <p>• Explorá todas las categorías</p>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🧪 Formulación Magistral</h3>
            <p className="text-sm text-gray-600">
              Productos formulados específicamente según las necesidades de cada tipo de piel
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🌿 100% Natural</h3>
            <p className="text-sm text-gray-600">
              Ingredientes naturales seleccionados por su eficacia y seguridad
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🚚 Envíos a todo el país</h3>
            <p className="text-sm text-gray-600">
              Llegamos a cualquier rincón de Argentina con envíos seguros
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Metadata para SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const categoria = resolvedSearchParams.categoria as string
  const busqueda = resolvedSearchParams.busqueda as string

  let title = 'Tienda - Formulaciones Di Rosa'
  let description =
    'Cosmética magistral y natural. Productos personalizados para el cuidado de tu piel.'

  if (categoria && categoria !== 'todos') {
    title = `${categoria} - Formulaciones Di Rosa`
    description = `Productos de ${categoria.toLowerCase()} - Cosmética magistral y natural.`
  }

  if (busqueda) {
    title = `"${busqueda}" - Formulaciones Di Rosa`
    description = `Resultados de búsqueda para "${busqueda}" - Cosmética magistral y natural.`
  }

  return {
    title,
    description,
  }
}
