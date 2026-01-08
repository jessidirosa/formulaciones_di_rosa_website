import ProductCard from './ProductCard'

interface Producto {
  id: string
  nombre: string
  slug: string
  descripcionCorta: string
  categoria: string
  precio: number
  imagen: string
  destacado: boolean
  stock: number
}

interface ProductGridProps {
  productos: Producto[]
}

export default function ProductGrid({ productos }: ProductGridProps) {
  if (productos.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          producto={producto}
        />
      ))}
    </div>
  )
}