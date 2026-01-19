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
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' }
  })

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
          categoria: true,
        },
      },
    },
  })

  return (
    <div className="bg-[#F5F5F0]"> {/* Fondo Beige Global */}

      {/* Hero Section - Estética Orgánica */}
      <section className="relative overflow-hidden bg-[#4A5D45] py-24 px-4">
        {/* Decoración sutil de fondo */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#A3B18A] opacity-10 rounded-l-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#A3B18A]/20 border border-[#A3B18A]/30 px-4 py-1.5 rounded-full">
                <span className="text-xs font-bold text-[#F5F5F0] uppercase tracking-widest">Est. 2004 — +20 años de experiencia</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-[#F5F5F0] leading-tight tracking-tight">
                Ciencia magistral <br />
                <span className="text-[#A3B18A]">con alma natural</span>
              </h1>

              <p className="text-xl text-[#F5F5F0]/80 leading-relaxed max-w-xl">
                Especialistas en formulaciones personalizadas, cosmética avanzada y salud capilar.
                Calidad farmacéutica, accesible y 100% cruelty free.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/tienda">
                  <Button size="lg" className="bg-[#A3B18A] hover:bg-[#8FA173] text-[#F5F5F0] px-10 rounded-full font-bold transition-all shadow-lg hover:shadow-emerald-900/20">
                    Explorar Catálogo
                  </Button>
                </Link>
                <Link href="/sobre-nosotros">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#F5F5F0]/30 text-[#F5F5F0] hover:bg-[#F5F5F0]/10 rounded-full px-10 font-bold"
                  >
                    Nuestra Historia
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-[#A3B18A] opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity"></div>
              <img
                src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800"
                alt="Formulaciones Di Rosa"
                className="relative rounded-3xl shadow-2xl w-full border-4 border-[#F5F5F0]/10 object-cover h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navegá por categorías - Chips Mejorados */}
      {categorias.length > 0 && (
        <section className="py-12 px-4 bg-[#E9E9E0] border-b border-[#D6D6C2]">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-sm font-bold text-[#4A5D45] uppercase tracking-widest mb-2">Especialidades</h2>
                <h3 className="text-2xl font-bold text-[#3A4031]">Navegá por categorías</h3>
              </div>
              <Link href="/tienda" className="text-[#4A5D45] font-bold text-sm hover:underline flex items-center gap-2">
                Ver todo el catálogo →
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/tienda">
                <Badge variant="outline" className="px-6 py-2.5 rounded-full border-[#D6D6C2] bg-white text-[#5B6350] hover:bg-[#4A5D45] hover:text-white transition-all cursor-pointer">
                  Todas
                </Badge>
              </Link>
              {categorias.map((cat) => (
                <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`}>
                  <Badge variant="outline" className="px-6 py-2.5 rounded-full border-[#D6D6C2] bg-white text-[#5B6350] hover:bg-[#4A5D45] hover:text-white transition-all cursor-pointer">
                    {cat.nombre}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Beneficios de la marca - Cards Estilo Minimalista */}
      <section className="py-24 px-4 bg-[#F5F5F0]">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: "🧪",
                title: "Formulación Magistral",
                desc: "Soluciones exclusivas y personalizadas bajo estándares farmacéuticos.",
                color: "bg-[#E9E9E0]"
              },
              {
                icon: "🐇",
                title: "100% Cruelty Free",
                desc: "Nacimos con la idea de ofrecer un cuidado ético y responsable.",
                color: "bg-[#E9E9E0]"
              },
              {
                icon: "🇦🇷",
                title: "Envíos a todo el país",
                desc: "Llegamos a lo largo y ancho de Argentina con empresas serias y seguras.",
                color: "bg-[#E9E9E0]"
              }
            ].map((beneficio, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className={`w-20 h-20 ${beneficio.color} rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                  {beneficio.icon}
                </div>
                <h4 className="text-xl font-bold text-[#3A4031] mb-3 uppercase tracking-tight">{beneficio.title}</h4>
                <p className="text-[#5B6350] leading-relaxed max-w-xs">{beneficio.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados - Tarjetas Refinadas */}
      <section className="py-24 px-4 bg-white rounded-t-[3rem] shadow-inner">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-[#A3B18A] font-bold uppercase tracking-widest text-xs">Selección del mes</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#3A4031] mt-4 mb-4">Productos destacados</h2>
            <div className="w-24 h-1 bg-[#4A5D45] mx-auto rounded-full"></div>
          </div>

          {productosDestacados.length === 0 ? (
            <p className="text-center text-[#5B6350] italic">Próximamente verás nuestras fórmulas estrella 🌿</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {productosDestacados.map((producto) => {
                const categoriaPrincipal = producto.categorias[0]?.categoria?.nombre || "Exclusivo"
                const imagenSrc = producto.imagen || `https://placehold.co/400x400?text=${encodeURIComponent(producto.nombre)}`

                return (
                  <Card key={producto.id} className="group border-none bg-transparent shadow-none">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6 shadow-md border border-[#F5F5F0]">
                      <img
                        src={imagenSrc}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-[#4A5D45] text-white border-none px-3 py-1 uppercase text-[10px]">Destacado</Badge>
                      </div>
                    </div>
                    <CardHeader className="p-0 mb-4">
                      <p className="text-[#A3B18A] text-xs font-bold uppercase tracking-wider mb-2">{categoriaPrincipal}</p>
                      <CardTitle className="text-xl text-[#3A4031] font-bold group-hover:text-[#4A5D45] transition-colors uppercase">
                        {producto.nombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mb-6">
                      <div className="text-2xl font-serif text-[#4A5D45]">
                        {formatPrice(producto.precio)}
                      </div>
                    </CardContent>
                    <CardFooter className="p-0">
                      <Link href={`/tienda/${producto.slug}`} className="w-full">
                        <Button className="w-full bg-[#3A4031] hover:bg-[#4A5D45] text-white rounded-xl py-6 font-bold tracking-wide">
                          Ver detalles
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action - Contacto */}
      <section className="bg-[#4A5D45] py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 text-[#F5F5F0]">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Asesoramiento personalizado
          </h2>
          <p className="text-xl mb-12 opacity-80 font-light leading-relaxed">
            Nuestro equipo de especialistas está a tu disposición para asesorarte sobre nuestras formulaciones exclusivas.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="https://wa.me/541122334455" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#F5F5F0] text-[#4A5D45] hover:bg-[#E9E9E0] px-10 py-7 rounded-full font-bold shadow-xl flex items-center gap-2">
                <span>WhatsApp Profesional</span>
              </Button>
            </a>
            <Link href="/contacto">
              <Button size="lg" variant="outline" className="border-[#F5F5F0]/30 text-[#F5F5F0] hover:bg-[#F5F5F0]/10 px-10 py-7 rounded-full font-bold">
                Enviar un mensaje
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}