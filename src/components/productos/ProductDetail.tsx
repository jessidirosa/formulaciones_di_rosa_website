'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'

// ---- Tipos que usamos en este componente ----
type ProductoDetalle = {
  id: number
  nombre: string
  slug: string
  descripcionCorta: string | null
  descripcionLarga?: string | null
  categoria: string | null
  precio: number
  imagen: string | null
  stock: number | null
  destacado: boolean
  // campos “extra” opcionales si algún día los agregamos
  beneficios?: string | null
  tiposPiel?: string | null
  modoUso?: string | null
}

type ProductoRelacionado = {
  id: number
  nombre: string
  slug: string
  descripcionCorta: string | null
  categoria: string | null
  precio: number
  imagen: string | null
  stock: number | null
  destacado: boolean
}

interface ProductDetailProps {
  producto: ProductoDetalle
  productosRelacionados: ProductoRelacionado[]
}

// helper para formatear ARS
const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value)

export default function ProductDetail({
  producto,
  productosRelacionados,
}: ProductDetailProps) {
  const { addItem } = useCart()


  const codigoPublico = String(producto.id).padStart(6, '0').slice(-6).toUpperCase()
  const imagenPrincipal = producto.imagen || '/images/placeholder-producto.jpg'
  const stockNum = producto.stock ?? 0
  const hayStock = stockNum > 0

  const handleAdd = () => {
    if (!hayStock) return
    addItem(
      {
        id: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        descripcionCorta: producto.descripcionCorta,
        categoria: producto.categoria ?? undefined,
        precio: producto.precio,
        imagen: producto.imagen ?? undefined,
        destacado: producto.destacado,
        stock: stockNum,
      } as any,
      1
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Columna imagen */}
      <Card className="overflow-hidden">
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={imagenPrincipal}
            alt={producto.nombre}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4 flex justify-between items-center text-xs text-gray-500">
          <div>
            <span className="text-gray-600">Código: </span>
            <span className="font-mono">{codigoPublico}</span>
          </div>
          {producto.categoria && (
            <Badge variant="outline">{producto.categoria}</Badge>
          )}
        </CardContent>
      </Card>

      {/* Columna info */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {producto.destacado && (
              <Badge className="bg-green-600">Destacado</Badge>
            )}
            {!hayStock && (
              <Badge variant="destructive">Sin stock</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {producto.nombre}
          </h1>
          {producto.descripcionCorta && (
            <p className="text-gray-600 text-sm">
              {producto.descripcionCorta}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Precio</p>
          <p className="text-3xl font-bold text-green-700">
            {formatPrice(producto.precio)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Envío gratis en compras superiores a{' '}
            <span className="font-semibold">
              {formatPrice(200000)}
            </span>
          </p>
        </div>

        {/* Descripción larga / modo de uso */}
        {(producto.descripcionLarga || producto.modoUso) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Descripción y modo de uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              {producto.descripcionLarga && (
                <p>{producto.descripcionLarga}</p>
              )}
              {producto.modoUso && (
                <div>
                  <p className="font-semibold mb-1">Modo de uso</p>
                  <p>{producto.modoUso}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleAdd}
            disabled={!hayStock}
          >
            {hayStock ? 'Agregar al carrito' : 'Sin stock'}
          </Button>
        </div>

        {/* Productos relacionados */}
        {productosRelacionados.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">
              También te pueden interesar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productosRelacionados.map((rel) => (
                <Card key={rel.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-gray-50">
                    <Image
                      src={rel.imagen || '/images/placeholder-producto.jpg'}
                      alt={rel.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{rel.nombre}</p>
                    {rel.descripcionCorta && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {rel.descripcionCorta}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-green-700">
                        {formatPrice(rel.precio)}
                      </span>
                      <Link href={`/tienda/${rel.slug}`}>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
