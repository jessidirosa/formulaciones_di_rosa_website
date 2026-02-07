import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import BenefitsSection from "@/components/home/BenefitsSection"
import { ArrowRight, Award, Sparkles, Phone } from 'lucide-react'
import ProBanner from "@/components/home/ProBanner"

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
    where: { activo: true, destacado: true },
    orderBy: { orden: 'asc' },
    take: 3,
    include: {
      presentaciones: true,
      categorias: { include: { categoria: true } },
    },
  })

  return (
    <main className="bg-[#F5F5F0] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#4A5D45] py-28 px-4 text-left">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#A3B18A] opacity-10 rounded-l-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full">
                <span className="w-2 h-2 bg-[#A3B18A] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-[0.2em]">Especialistas en Formulación Magistral • Est. 2004</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-[#F5F5F0] leading-[1.1] tracking-tight">
                Ciencia pura <br />
                <span className="text-[#A3B18A] font-serif font-light italic italic">con alma natural</span>
              </h1>
              <p className="text-xl text-[#F5F5F0]/80 leading-relaxed max-w-xl font-light">
                Más de 20 años desarrollando cosmética avanzada y salud capilar. Calidad farmacéutica diseñada para potenciar tu belleza natural.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Link href="/tienda">
                  <Button size="lg" className="bg-[#A3B18A] hover:bg-[#8FA173] text-[#F5F5F0] px-12 h-16 rounded-full font-bold transition-all shadow-2xl hover:shadow-[#A3B18A]/40 uppercase text-xs tracking-widest">
                    Explorar Tienda
                  </Button>
                </Link>
                <Link href="/sobre-nosotros">
                  <Button variant="outline" size="lg" className="border-white/30 text-[#F5F5F0] bg-white/5 hover:bg-white/10 rounded-full px-12 h-16 font-bold transition-all uppercase text-xs tracking-widest">
                    Nuestra Historia
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative group hidden lg:block">
              <div className="absolute -inset-10 bg-[#A3B18A] opacity-10 rounded-full blur-[100px]" />
              <img src="https://res.cloudinary.com/dj71ufqjc/image/upload/v1770506909/Dise%C3%B1o_sin_t%C3%ADtulo_bookba.png" />
            </div>
          </div>
        </div>
      </section>

      <BenefitsSection />

      {/* ✅ BANNER DE CAPTACIÓN PROFESIONAL (Usando el componente oficial) */}
      <ProBanner />

      {/* Navegá por categorías */}
      {categorias.length > 0 && (
        <section className="py-16 px-4 bg-[#E9E9E0] border-y border-[#D6D6C2] text-left">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-[10px] font-bold text-[#4A5D45] uppercase tracking-[0.3em] mb-3">Especialidades Magistrales</h2>
                <h3 className="text-3xl font-bold text-[#3A4031] leading-tight">Navegá por nuestras líneas</h3>
              </div>
              <Link href="/tienda" className="text-[#4A5D45] font-bold text-sm hover:tracking-widest transition-all flex items-center gap-2 uppercase">
                Ver todo el catálogo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/tienda">
                <Badge variant="outline" className="px-8 py-3 rounded-2xl border-[#D6D6C2] bg-white text-[#5B6350] hover:bg-[#4A5D45] hover:text-white hover:border-[#4A5D45] transition-all cursor-pointer shadow-sm text-xs font-bold uppercase">Todas</Badge>
              </Link>
              {categorias.map((cat) => (
                <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`}>
                  <Badge variant="outline" className="px-8 py-3 rounded-2xl border-[#D6D6C2] bg-white text-[#5B6350] hover:bg-[#4A5D45] hover:text-white hover:border-[#4A5D45] transition-all cursor-pointer shadow-sm text-xs font-bold uppercase">{cat.nombre}</Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Productos Destacados */}
      <section className="py-24 px-4 bg-white rounded-t-[4rem] -mt-10 shadow-2xl relative z-20 text-left">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <Badge variant="outline" className="border-[#A3B18A] text-[#A3B18A] uppercase px-4 py-1 text-[9px] font-bold tracking-[0.2em]">Formulaciones Estrella</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#3A4031] mt-6 mb-6 leading-tight">Nuestra selección de productos</h2>
            <div className="w-20 h-1.5 bg-[#A3B18A] mx-auto rounded-full" />
          </div>

          {productosDestacados.length === 0 ? (
            <p className="text-center text-[#5B6350] italic">Preparando la próxima tanda de fórmulas destacadas... 🌿</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {productosDestacados.map((producto) => {
                const categoriaPrincipal = producto.categorias[0]?.categoria?.nombre || "Exclusivo"
                const tienePresentaciones = producto.presentaciones && producto.presentaciones.length > 0
                const precioMostrar = tienePresentaciones ? Math.min(...producto.presentaciones.map(p => p.precio)) : (producto.precio || 0)

                return (
                  <Card key={producto.id} className="group border-none bg-transparent shadow-none text-left">
                    <Link href={`/tienda/${producto.slug}`}>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 shadow-xl shadow-[#3A4031]/5 border border-[#F5F5F0] transition-all group-hover:shadow-2xl">
                        <img src={producto.imagen || `https://placehold.co/400x500?text=${producto.nombre}`} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-white/90 backdrop-blur-md text-[#4A5D45] border-none px-4 py-1.5 uppercase text-[9px] font-bold shadow-sm">Magistral</Badge>
                        </div>
                      </div>
                    </Link>
                    <CardHeader className="p-0 mb-4 px-2">
                      <p className="text-[#A3B18A] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{categoriaPrincipal}</p>
                      <CardTitle className="text-2xl text-[#3A4031] font-bold group-hover:text-[#4A5D45] transition-colors uppercase leading-tight">
                        {producto.nombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mb-8 px-2">
                      <div className="text-3xl font-serif font-medium text-[#4A5D45]">
                        {tienePresentaciones && <span className="text-[10px] uppercase font-bold text-[#A3B18A] mr-2">Desde</span>}
                        {formatPrice(precioMostrar)}
                      </div>
                    </CardContent>
                    <CardFooter className="p-0">
                      <Link href={`/tienda/${producto.slug}`} className="w-full">
                        <Button className="w-full bg-[#3A4031] hover:bg-[#4A5D45] text-white rounded-2xl py-8 font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95">
                          Ver Detalles <ArrowRight className="ml-2 w-3 h-3" />
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

      {/* CTA Final - Refinado con Marca Blanca */}
      <section className="bg-[#1A1C18] py-28 px-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#A3B18A] to-transparent opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-10 text-[#F5F5F0]">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            ¿Tenés un proyecto en mente?
          </h2>
          <p className="text-xl mb-12 opacity-70 font-light leading-relaxed max-w-2xl mx-auto italic text-center">
            Desde asesoramiento personalizado hasta la creación de tu propia marca. Estamos aquí para hacerlo realidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="https://wa.me/541137024467" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#A3B18A] text-white hover:bg-white hover:text-[#4A5D45] px-12 py-8 rounded-full font-bold shadow-2xl flex items-center gap-3 uppercase text-xs tracking-widest transition-all">
                <Phone className="w-4 h-4" /> <span>WhatsApp Directo</span>
              </Button>
            </a>
            <Link href="/servicios">
              <Button size="lg" variant="outline" className="border-white/20 text-[#F5F5F0] bg-white/5 hover:bg-white/10 px-12 py-8 rounded-full font-bold transition-all uppercase text-xs tracking-widest">
                Servicios a Medida
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}