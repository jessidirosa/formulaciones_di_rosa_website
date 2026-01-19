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
    /* Mejoras aplicadas:
       1. Gap aumentado a 8 para que los productos respiren mejor (estética premium).
       2. Animación de entrada sutil para mejorar la experiencia de usuario.
       3. Padding inferior para evitar que el grid choque con el footer.
    */
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