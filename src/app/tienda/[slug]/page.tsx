import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ProductDetail from '@/components/productos/ProductDetail'

export const dynamic = 'force-dynamic';

// 🔹 Obtener producto por slug
async function getProducto(slug: string) {
  try {
    const producto = await prisma.producto.findFirst({
      where: {
        slug,
        activo: true,
      },
      include: {
        presentaciones: true,
      }
    })
    return producto
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return null
  }
}

// 🔹 Productos relacionados
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

  // 🔹 Esquema de datos estructurados para Google (JSON-LD)
  // Esto hace que tu producto aparezca con precio y stock en Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    image: producto.imagen,
    description: producto.descripcionCorta || `Fórmula magistral de alta calidad elaborada en Laboratorio Di Rosa.`,
    brand: {
      '@type': 'Brand',
      name: 'Formulaciones Di Rosa'
    },
    offers: {
      '@type': 'Offer',
      price: producto.precio,
      priceCurrency: 'ARS',
      availability: (producto.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXTAUTH_URL}/tienda/${slug}`,
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Insertamos el JSON-LD en el head de forma segura */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetail
        producto={producto as any}
        productosRelacionados={productosRelacionados}
      />
    </div>
  )
}

// 🔹 Metadata SEO Optimizada
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

  const baseUrl = process.env.NEXTAUTH_URL || 'https://tu-dominio.com' // Cambiar por tu dominio real
  const img = producto.imagen || '/images/placeholder-producto.jpg'
  const seoDescription = producto.descripcionCorta || `Descubrí ${producto.nombre} en Formulaciones Di Rosa. Cosmética magistral y personalizada para el cuidado de tu piel.`

  return {
    title: `${producto.nombre} | Cosmética Magistral Di Rosa`,
    description: seoDescription,
    keywords: `${producto.nombre}, cosmética magistral, laboratorio di rosa, cuidado de la piel, fórmula personalizada, ${producto.categoria}`,
    openGraph: {
      title: `${producto.nombre} - Formulaciones Di Rosa`,
      description: seoDescription,
      images: [
        {
          url: img,
          width: 800,
          height: 800,
          alt: producto.nombre,
        }
      ],
      url: `${baseUrl}/tienda/${slug}`,
      siteName: 'Formulaciones Di Rosa',
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${producto.nombre} | Formulaciones Di Rosa`,
      description: seoDescription,
      images: [img],
    },
    alternates: {
      canonical: `${baseUrl}/tienda/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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