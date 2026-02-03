import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ProductDetail from '@/components/productos/ProductDetail'

// 🔹 Obtener producto por slug (Actualizado con include)
async function getProducto(slug: string) {
  try {
    const producto = await prisma.producto.findFirst({
      where: {
        slug,
        activo: true,
      },
      include: {
        presentaciones: true, // 👈 VITAL: Sin esto el componente ProductDetail no recibe los tamaños
      }
    })

    return producto
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return null
  }
}

// 🔹 Productos relacionados (misma categoría principal)
async function getProductosRelacionados(categoria: string | null, excludeId: number) {
  if (!categoria) return []

  try {
    const productos = await prisma.producto.findMany({
      where: {
        categoria,
        activo: true,
        id: { not: excludeId },
      },
      take: 4,
      orderBy: [
        { destacado: 'desc' },
        { creadoEn: 'desc' },
      ],
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcionCorta: true,
        categoria: true,
        precio: true,
        imagen: true,
        destacado: true,
        stock: true,
      },
    })

    return productos
  } catch (error) {
    console.error('Error al obtener productos relacionados:', error)
    return []
  }
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const producto = await getProducto(slug)

  if (!producto) {
    notFound()
  }

  const productosRelacionados = await getProductosRelacionados(
    producto.categoria,
    producto.id,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail
        producto={producto as any}
        productosRelacionados={productosRelacionados}
      />
    </div>
  )
}

// 🔹 Metadata SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProducto(slug)

  if (!producto) {
    return {
      title: 'Producto no encontrado - Formulaciones Di Rosa',
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const img = producto.imagen || '/images/placeholder-producto.jpg'

  return {
    title: `${producto.nombre} - Formulaciones Di Rosa`,
    description: producto.descripcionCorta ?? undefined,
    openGraph: {
      title: `${producto.nombre} - Formulaciones Di Rosa`,
      description: producto.descripcionCorta ?? undefined,
      images: [img],
      url: `${baseUrl}/tienda/${slug}`,
      siteName: 'Formulaciones Di Rosa',
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${producto.nombre} - Formulaciones Di Rosa`,
      description: producto.descripcionCorta ?? undefined,
      images: [img],
    },
    alternates: {
      canonical: `${baseUrl}/tienda/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      select: { slug: true },
    })

    return productos.map((p) => ({ slug: p.slug }))
  } catch (error) {
    console.error('Error al generar rutas estáticas:', error)
    return []
  }
}