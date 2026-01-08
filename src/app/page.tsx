// app/page.tsx (o la ruta donde tengas este home)
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

export default async function HomePage() {
  // 🔹 Traemos categorías para el bloque "Navegá por categorías"
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' }
  })

  // 🔹 Traemos productos destacados reales
  const productosDestacados = await prisma.producto.findMany({
    where: {
      activo: true,
      destacado: true,
    },
    orderBy: { orden: 'asc' },
    take: 3,
    include: {
      categorias: {
        include: {
          categoria: true,   // ✅
        },
      },
    },
  })


  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-pink-50 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="text-green-600 border-green-200">
                Cosmética Magistral & Natural
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Preparaciones personalizadas para el cuidado de tu piel
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Descubrí nuestra línea de productos magistrales elaborados especialmente para tu tipo de piel.
                Cosmética natural, cruelty free y con envíos a todo el país.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/tienda">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    Ver catálogo
                  </Button>
                </Link>
                <Link href="/sobre-nosotros">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    Conocé más
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://placehold.co/600x500?text=Cosm%C3%A9tica+natural+Formulaciones+Di+Rosa"
                alt="Productos de cosmética natural Formulaciones Di Rosa"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios de la marca */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Formulaciones Di Rosa?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprometidos con la calidad, la naturalidad y el cuidado responsable de tu piel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">Cosmética Magistral</CardTitle>
                <CardDescription className="text-gray-600">
                  Productos formulados específicamente para las necesidades de tu piel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">100% Cruelty Free</CardTitle>
                <CardDescription className="text-gray-600">
                  No realizamos pruebas en animales. Cosmética ética y responsable
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">Envíos a todo el país</CardTitle>
                <CardDescription className="text-gray-600">
                  Llegamos a cualquier rincón de Argentina con envíos seguros y rápidos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 🔹 Bloque: Navegá por categorías (item 5 vibes) */}
      {categorias.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Navegá por categorías
                </h2>
                <p className="text-sm text-gray-600">
                  Encontrá más fácil lo que estás buscando
                </p>
              </div>
              <Link href="/tienda">
                <Button variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
                  Ver todo el catálogo
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/tienda">
                <Badge
                  variant="outline"
                  className="px-4 py-2 cursor-pointer border-gray-300 hover:bg-white"
                >
                  Todas
                </Badge>
              </Link>

              {categorias.map((cat) => (
                <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`}>
                  <Badge
                    variant="outline"
                    className="px-4 py-2 cursor-pointer border-green-200 text-green-700 hover:bg-white"
                  >
                    {cat.nombre}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Productos Destacados (dinámicos) */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Productos destacados
            </h2>
            <p className="text-lg text-gray-600">
              Descubrí algunos de nuestros productos más elegidos
            </p>
          </div>

          {productosDestacados.length === 0 ? (
            <p className="text-center text-gray-500">
              Próximamente vas a ver acá tus productos destacados 💚
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {productosDestacados.map((producto) => {
                  const categoriaPrincipal =
                    producto.categorias[0]?.categoria?.nombre ||
                    producto.categoria ||
                    "Cosmética"


                  const imagenSrc =
                    producto.imagen ||
                    `https://placehold.co/400x400?text=${encodeURIComponent(
                      producto.nombre
                    )}`

                  return (
                    <Card
                      key={producto.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={imagenSrc}
                          alt={producto.nombre}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {producto.nombre}
                            </CardTitle>
                            <CardDescription>{categoriaPrincipal}</CardDescription>
                          </div>
                          <Badge variant="secondary">Destacado</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Si querés, después podemos sumar una descripción corta desde BD */}
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(producto.precio)}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/tienda/${producto.slug}`} className="w-full">
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            Ver producto
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>

              <div className="text-center">
                <Link href="/tienda">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    Ver todos los productos
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Llamado a contacto */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Tenés dudas sobre qué producto es mejor para tu piel?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Nuestro equipo de especialistas está listo para asesorarte y encontrar la formulación perfecta para vos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/541122334455?text=Hola!%20Me%20interesa%20conocer%20m%C3%A1s%20sobre%20los%20productos%20de%20Formulaciones%20Di%20Rosa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Contactanos por WhatsApp
              </Button>
            </a>
            <Link href="/contacto">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Formulario de contacto
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
