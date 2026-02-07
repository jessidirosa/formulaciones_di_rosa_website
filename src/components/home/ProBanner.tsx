'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Award, ArrowRight, Sparkles } from 'lucide-react'

export default function ProBanner() {
    return (
        <section className="py-12 container mx-auto px-4">
            <Link href="/servicios" className="block group">
                <div className="relative bg-[#3A4031] rounded-[3rem] p-8 md:p-14 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 cursor-pointer shadow-2xl transition-all hover:scale-[1.01] border border-white/5">

                    {/* Decoración de fondo */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#A3B18A] opacity-10 rounded-full -mr-32 -mt-32 blur-[80px] transition-transform group-hover:scale-125 duration-1000" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-[0.02] rounded-full -ml-10 -mb-10 blur-2xl" />

                    {/* Contenido Izquierdo */}
                    <div className="flex items-center gap-8 text-left relative z-10">
                        <div className="hidden md:flex w-24 h-24 bg-[#4A5D45] rounded-[2rem] items-center justify-center shadow-inner border border-white/10 group-hover:rotate-6 transition-transform duration-500">
                            <Award className="w-12 h-12 text-[#A3B18A]" />
                        </div>

                        <div className="space-y-4">
                            <Badge className="bg-[#A3B18A] text-white border-none px-4 py-1 uppercase text-[10px] font-black tracking-[0.2em]">
                                Área Profesional
                            </Badge>
                            <h3 className="text-3xl md:text-5xl font-serif font-bold text-[#F5F5F0] leading-tight">
                                ¿Sos profesional de la <br />
                                <span className="italic font-light text-[#A3B18A]">estética o salud?</span>
                            </h3>
                            <p className="text-[#F5F5F0]/70 text-lg max-w-xl font-light">
                                Accedé a listas de precios preferenciales, formulaciones personalizadas y asesoramiento técnico directo para tu consultorio.
                            </p>
                        </div>
                    </div>

                    {/* Botón / Acción */}
                    <div className="relative z-10 w-full lg:w-auto">
                        <Button className="w-full lg:w-auto bg-[#F5F5F0] text-[#3A4031] hover:bg-white rounded-2xl px-10 h-16 font-extrabold uppercase text-xs tracking-[0.15em] shadow-xl group-hover:shadow-[#A3B18A]/20 transition-all">
                            Obtener mi beneficio <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-[10px] text-[#A3B18A] uppercase font-bold text-center mt-4 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Validación inmediata vía WhatsApp
                        </p>
                    </div>

                </div>
            </Link>
        </section>
    )
}