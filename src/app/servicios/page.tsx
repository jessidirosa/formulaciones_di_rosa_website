'use client'

import { Sparkles, Palette, FlaskConical, Award, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function ServiciosPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F0]">
            {/* Hero Section - Refinada con overlay orgánico */}
            <section className="relative bg-[#4A5D45] py-24 px-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[#A3B18A] opacity-5 rounded-l-full blur-3xl" />
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <Badge className="bg-[#A3B18A]/30 text-[#F5F5F0] mb-6 uppercase tracking-[0.3em] px-6 py-1.5 border border-[#A3B18A]/50 rounded-full text-[10px] font-bold">
                        Servicios Exclusivos Di Rosa
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#F5F5F0] mb-8 leading-tight">
                        Tu visión, <br /><span className="italic font-light opacity-90">nuestra maestría técnica.</span>
                    </h1>
                    <p className="text-[#F5F5F0]/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                        Desde el desarrollo de fórmulas exclusivas hasta el diseño integral de tu propia marca. Ciencia magistral puesta a tu servicio.
                    </p>
                </div>
            </section>

            {/* Marca Propia - Enfoque Premium */}
            <section className="py-24 container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8 text-left">
                        <div className="inline-flex items-center gap-3 text-[#A3B18A] border-b border-[#A3B18A]/20 pb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Marca Propia & Personalizada</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3A4031] leading-tight">Lanzá tu línea de cosmética personalizada</h2>
                        <p className="text-[#5B6350] text-lg leading-relaxed">
                            Desarrollamos formulaciones de nuestro catálogo o <strong>creaciones desde cero</strong> según tus indicaciones. Garantizamos exclusividad y calidad farmacéutica en cada mililitro.
                        </p>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-[#E9E9E0] shadow-xl shadow-[#4A5D45]/5 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Palette className="w-24 h-24" />
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="bg-[#F9F9F7] p-3 rounded-2xl">
                                    <Palette className="w-6 h-6 text-[#4A5D45]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#3A4031] text-sm uppercase">Branding & Diseño Integral</h4>
                                    <p className="text-sm text-[#5B6350] mt-1 italic">Logotipo, paleta de colores y diseño de etiquetas listas para impresión.</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-[#F5F5F0] flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-[#A3B18A] block">Inversión Inicial</span>
                                    <span className="text-xs text-[#5B6350]">Pago único por diseño</span>
                                </div>
                                <span className="text-3xl font-serif font-bold text-[#4A5D45]">$70.000</span>
                            </div>
                        </div>

                        <a href="https://wa.me/541137024467" target="_blank" className="block">
                            <Button className="w-full sm:w-auto bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-full px-12 h-16 font-bold uppercase text-xs tracking-widest shadow-2xl transition-all hover:-translate-y-1">
                                Iniciar mi proyecto <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/5] bg-[#E9E9E0] rounded-[4rem] overflow-hidden shadow-2xl transform rotate-2">
                            <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800" alt="Marca Propia" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                        </div>
                        <div className="absolute -bottom-10 -right-5 bg-[#3A4031] p-10 rounded-[2rem] shadow-2xl max-w-xs border border-white/10">
                            <p className="text-[#F5F5F0] font-serif italic text-xl leading-snug">"Convertimos el conocimiento farmacéutico en el ADN de tu marca."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Descuento Profesional - Estilo Pasos Limpios */}
            <section className="bg-[#F9F9F7] py-24 border-y border-[#E9E9E0]">
                <div className="container mx-auto px-4 max-w-5xl text-center">
                    <div className="mb-16">
                        <div className="w-16 h-16 bg-[#4A5D45] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Award className="w-8 h-8 text-[#A3B18A]" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#3A4031]">Comunidad de Profesionales</h2>
                        <p className="text-[#5B6350] mt-4 text-lg max-w-xl mx-auto italic font-medium">Beneficios exclusivos para expertos de la salud y la estética.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
                        {[
                            { icon: <UserCheck />, title: "Validación", desc: "Envianos por WhatsApp tu título o matrícula profesional." },
                            { icon: <FlaskConical />, title: "Cupón Activo", desc: "Te generamos un código personalizado para tus compras." },
                            { icon: <CheckCircle2 />, title: "Compra Online", desc: "Aplicá tu descuento al finalizar el carrito y listo." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-10 rounded-[3rem] border border-[#E9E9E0] hover:border-[#A3B18A] transition-colors group relative shadow-sm overflow-hidden">
                                {/* Icono y Texto con z-10 para quedar arriba */}
                                <div className="relative z-10">
                                    <div className="text-[#A3B18A] mb-6 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                                    <h4 className="font-bold text-[#3A4031] uppercase tracking-widest text-xs mb-3">{item.title}</h4>
                                    <p className="text-sm text-[#5B6350] leading-relaxed">{item.desc}</p>
                                </div>

                                {/* Número decorativo con z-0 para quedar detrás */}
                                <span className="absolute bottom-2 right-6 text-7xl font-serif font-bold text-[#F5F5F0] group-hover:text-[#F9F9F7] transition-colors z-0 pointer-events-none select-none">
                                    0{i + 1}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16">
                        <a href="https://wa.me/541137024467" target="_blank">
                            <Button variant="outline" className="border-[#4A5D45] text-[#4A5D45] hover:bg-[#4A5D45] hover:text-white rounded-full px-12 h-14 font-bold uppercase text-[10px] tracking-[0.2em] transition-all shadow-md">
                                Solicitar Cupón Profesional
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}