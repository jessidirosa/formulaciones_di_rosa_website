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
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#D6D6C2]">
        <p className="text-[#5B6350] italic">No encontramos fórmulas que coincidan con tu búsqueda.</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12 animate-in fade-in duration-700">
      {productos.map((producto) => (
        <div
          key={producto.id}
          className="flex justify-center"
        >
          <ProductCard
            producto={producto}
          />
        </div>
      ))}
    </div>
  )
}