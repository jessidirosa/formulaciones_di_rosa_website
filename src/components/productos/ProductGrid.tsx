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
      <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-[#D6D6C2]">
        <p className="text-[#5B6350] italic font-light">No encontramos fórmulas disponibles en este momento.</p>
      </div>
    )
  }

  return (
    /* ✅ GRID CORREGIDO: 2 columnas en móvil (grid-cols-2), 3 en tablet, 4 en desktop */
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {productos.map((producto) => (
        <div key={producto.id} className="w-full">
          <ProductCard producto={producto} />
        </div>
      ))}
    </div>
  )
}