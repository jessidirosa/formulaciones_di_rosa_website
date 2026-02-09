import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import BenefitsSection from "@/components/home/BenefitsSection"
import { ArrowRight, Sparkles, Phone, ChevronRight } from 'lucide-react'
import ProBanner from "@/components/home/ProBanner"

export const revalidate = 0;

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0
  }).format(value)
}

export default async function HomePage() {
  const categorias = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } })
  const productosDestacados = await prisma.producto.findMany({
    where: { activo: true, destacado: true },
    orderBy: { orden: 'asc' },
    take: 6, // Traemos un par más para el carrusel
    include: { presentaciones: true, categorias: { include: { categoria: true } } },
  })

  return (
    <main className="bg-[#F5F5F0] min-h-screen">
      <section className="relative overflow-hidden bg-[#4A5D45] py-28 px-4 text-left">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#A3B18A] opacity-10 rounded-l-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full">
                <span className="w-2 h-2 bg-[#A3B18A] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-[0.2em]">Formulación Magistral • Est. 2004</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-[#F5F5F0] leading-[1.1] tracking-tight uppercase">
                Ciencia pura <br />
                <span className="text-[#A3B18A] font-serif font-light italic">con alma natural</span>
              </h1>
              <p className="text-xl text-[#F5F5F0]/80 leading-relaxed max-w-xl font-light italic text-left">
                Calidad farmacéutica diseñada para potenciar tu belleza natural con ingredientes botánicos.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Link href="/tienda">
                  <Button size="lg" className="bg-[#A3B18A] hover:bg-[#8FA173] text-[#F5F5F0] px-12 h-16 rounded-full font-bold uppercase text-xs tracking-widest shadow-2xl">
                    Explorar Tienda
                  </Button>
                </Link>
                <Link href="/sobre-nosotros">
                  <Button variant="outline" size="lg" className="border-white/30 text-[#F5F5F0] bg-white/5 hover:bg-white/10 rounded-full px-12 h-16 font-bold uppercase text-xs tracking-widest">
                    Nosotros
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img src="https://res.cloudinary.com/dj71ufqjc/image/upload/v1770506909/Dise%C3%B1o_sin_t%C3%ADtulo_bookba.png" alt="Hero" className="w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      <BenefitsSection />
      <ProBanner />

      {/* Productos Destacados en CARRUSEL para móvil */}
      <section className="py-24 px-4 bg-white rounded-t-[4rem] -mt-10 shadow-2xl relative z-20 text-left overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-16 px-4">
            <div className="text-left">
              <Badge variant="outline" className="border-[#A3B18A] text-[#A3B18A] uppercase px-4 py-1 text-[9px] font-bold tracking-[0.2em]">Selección Premium</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-[#3A4031] mt-4 uppercase tracking-tighter">Nuestras Fórmulas</h2>
            </div>
            <Link href="/tienda" className="hidden md:flex items-center gap-2 text-[#A3B18A] font-bold text-xs uppercase tracking-widest">
              Ver tienda <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ✅ CONTENEDOR DESLIZABLE HORIZONTAL EN MÓVIL */}
          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto no-scrollbar pb-10 px-4 -mx-4 snap-x snap-mandatory">
            {productosDestacados.map((producto) => {
              const categoriaPrincipal = producto.categorias[0]?.categoria?.nombre || "Exclusivo"
              const precioMostrar = producto.presentaciones?.[0]?.precio || producto.precio || 0

              return (
                <Card key={producto.id} className="min-w-[85vw] md:min-w-0 snap-center group border-none bg-transparent shadow-none text-left">
                  <Link href={`/tienda/${producto.slug}`}>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] mb-6 shadow-xl border border-[#F5F5F0]">
                      <img src={producto.imagen || "https://placehold.co/400x500"} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-white/90 backdrop-blur-md text-[#4A5D45] border-none px-4 py-1.5 uppercase text-[9px] font-bold">Destacado</Badge>
                      </div>
                    </div>
                  </Link>
                  <div className="px-2">
                    <p className="text-[#A3B18A] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{categoriaPrincipal}</p>
                    <h3 className="text-2xl text-[#3A4031] font-bold uppercase leading-tight mb-4">{producto.nombre}</h3>
                    <div className="text-3xl font-serif font-bold text-[#4A5D45] mb-6">{formatPrice(precioMostrar)}</div>
                    <Link href={`/tienda/${producto.slug}`}>
                      <Button className="w-full bg-[#3A4031] hover:bg-[#4A5D45] text-white rounded-2xl py-7 font-bold uppercase text-[10px] tracking-widest shadow-lg">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-[#1A1C18] py-28 px-6 text-center">
        <div className="max-w-4xl mx-auto text-[#F5F5F0]">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tighter">¿Hablamos?</h2>
          <p className="text-xl mb-12 opacity-60 font-light italic max-w-2xl mx-auto">
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

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}