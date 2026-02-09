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
import { ArrowRight, Award, Sparkles, Phone, ChevronRight, Factory, Users } from 'lucide-react'
import ProBanner from "@/components/home/ProBanner"

// Forzamos que la página no use caché estática para que los cambios en "destacados" se vean al instante
export const revalidate = 0;

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

  // Consulta optimizada para asegurar que traiga los productos marcados como destacados: true
  const productosDestacados = await prisma.producto.findMany({
    where: {
      activo: true,
      destacado: true
    },
    orderBy: { orden: 'asc' },
    take: 6, // Traemos un par más para el carrusel
    include: {
      presentaciones: true,
      categorias: {
        include: {
          categoria: true
        }
      },
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
              <h1 className="text-5xl md:text-7xl font-bold text-[#F5F5F0] leading-[1.1] tracking-tight uppercase">
                Ciencia pura <br />
                <span className="text-[#A3B18A] font-serif font-light italic lowercase">con alma natural</span>
              </h1>
              <p className="text-xl text-[#F5F5F0]/80 leading-relaxed max-w-xl font-light italic text-left">
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
              <img
                src="https://res.cloudinary.com/dj71ufqjc/image/upload/v1770506909/Dise%C3%B1o_sin_t%C3%ADtulo_bookba.png"
                alt="Laboratorio Di Rosa Hero"
                className="relative z-10 w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <BenefitsSection />

      {/* ✅ SECCIÓN DE MARCA PROPIA Y DISTRIBUIDORES */}
      <section className="py-24 px-4 bg-[#F9F9F7] text-left">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-[#3A4031] rounded-[3rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 hidden lg:block">
              <Factory className="w-64 h-64 text-white" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10 md:p-16 items-center">
              <div className="space-y-8 relative z-10">
                <Badge className="bg-[#A3B18A] text-white border-none px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold">
                  B2B & Emprendedores
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight uppercase tracking-tighter">
                  Tu propia marca <br />
                  <span className="text-[#A3B18A] font-serif font-light italic lowercase">con respaldo magistral</span>
                </h2>
                <p className="text-[#F5F5F0]/70 text-lg font-light leading-relaxed italic">
                  ¿Sos distribuidor o querés lanzar tu línea de productos? En Di Rosa desarrollamos fórmulas exclusivas de alta gama para que puedas comercializar con tu propia identidad.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/servicios">
                    <Button className="bg-white text-[#3A4031] hover:bg-[#F5F5F0] rounded-full px-8 h-14 font-bold uppercase text-[10px] tracking-widest transition-all">
                      Servicios de Laboratorio <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <a href="https://wa.me/541137024467" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 h-14 font-bold uppercase text-[10px] tracking-widest transition-all">
                      Consultar por Mayor
                    </Button>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-[#A3B18A] mx-auto" />
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">Fórmulas Exclusivas</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 text-center space-y-3">
                  <Users className="w-8 h-8 text-[#A3B18A] mx-auto" />
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">Atención Mayorista</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ BANNER DE CAPTACIÓN PROFESIONAL */}
      <ProBanner />

      {/* Navegá por categorías */}
      {categorias.length > 0 && (
        <section className="py-16 px-4 bg-[#E9E9E0] border-y border-[#D6D6C2] text-left">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-[10px] font-bold text-[#4A5D45] uppercase tracking-[0.3em] mb-3">Especialidades Magistrales</h2>
                <h3 className="text-3xl font-bold text-[#3A4031] leading-tight text-left">Navegá por nuestras líneas</h3>
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
      <section className="py-24 px-4 bg-white rounded-t-[4rem] -mt-10 shadow-2xl relative z-20 text-left overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-16 px-4 text-left">
            <div className="text-left">
              <Badge variant="outline" className="border-[#A3B18A] text-[#A3B18A] uppercase px-4 py-1 text-[9px] font-bold tracking-[0.2em]">Selección destacada</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-[#3A4031] mt-4 uppercase tracking-tighter text-left">Nuestras Fórmulas más elegidas</h2>
            </div>
            <Link href="/tienda" className="hidden md:flex items-center gap-2 text-[#A3B18A] font-bold text-xs uppercase tracking-widest">
              Ver tienda <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {productosDestacados.length === 0 ? (
            <p className="text-center text-[#5B6350] italic py-10">Próximamente verás nuestras fórmulas estrella aquí 🌿</p>
          ) : (
            <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-10 px-4 -mx-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {productosDestacados.map((producto) => {
                const categoriaPrincipal = producto.categorias[0]?.categoria?.nombre || "Exclusivo"
                const imagenSrc = producto.imagen || `https://placehold.co/400x500?text=${encodeURIComponent(producto.nombre)}`
                const tienePresentaciones = producto.presentaciones && producto.presentaciones.length > 0
                const precioMostrar = tienePresentaciones
                  ? Math.min(...producto.presentaciones.map(p => p.precio))
                  : (producto.precio || 0)

                return (
                  <Card key={producto.id} className="min-w-[85vw] md:min-w-0 snap-center group border-none bg-transparent shadow-none text-left">
                    <Link href={`/tienda/${producto.slug}`}>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] mb-6 shadow-xl border border-[#F5F5F0] transition-all group-hover:shadow-2xl">
                        <img
                          src={imagenSrc}
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-white/90 backdrop-blur-md text-[#4A5D45] border-none px-4 py-1.5 uppercase text-[9px] font-bold shadow-sm">Destacado</Badge>
                        </div>
                      </div>
                    </Link>
                    <div className="px-2">
                      <p className="text-[#A3B18A] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{categoriaPrincipal}</p>
                      <h3 className="text-2xl text-[#3A4031] font-bold uppercase leading-tight mb-4 group-hover:text-[#4A5D45] transition-colors text-left">
                        {producto.nombre}
                      </h3>
                      <div className="text-3xl font-serif font-bold text-[#4A5D45] mb-6 text-left">
                        {tienePresentaciones && <span className="text-[10px] uppercase font-bold text-[#A3B18A] mr-2">Desde</span>}
                        {formatPrice(precioMostrar)}
                      </div>
                      <Link href={`/tienda/${producto.slug}`}>
                        <Button className="w-full bg-[#3A4031] hover:bg-[#4A5D45] text-white rounded-2xl py-7 font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95">
                          Ver Detalles <ArrowRight className="ml-2 w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-[#1A1C18] py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#A3B18A] to-transparent opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-10 text-[#F5F5F0]">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tighter text-center">¿Hablamos?</h2>
          <p className="text-xl mb-12 opacity-60 font-light italic max-w-2xl mx-auto text-center">
            Desde asesoramiento personalizado hasta la creación de tu propia marca magistral.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="https://wa.me/541137024467" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#A3B18A] text-white hover:bg-white hover:text-[#4A5D45] px-12 py-8 rounded-full font-bold uppercase text-xs tracking-widest transition-all">
                <Phone className="w-4 h-4 mr-2" /> WhatsApp Directo
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}