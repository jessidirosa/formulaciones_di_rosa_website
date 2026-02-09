"use client"

import { useState, useEffect } from 'react'
import { X, Sparkles, Send, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PromoModal() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Se muestra a los 3 segundos de entrar para no ser brusco
        const hasSeenModal = sessionStorage.getItem('hasSeenPromoModal')
        if (!hasSeenModal) {
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const closeByButton = () => {
        setIsOpen(false)
        sessionStorage.setItem('hasSeenPromoModal', 'true')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative bg-[#F5F5F0] w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-white/20">

                {/* Botón cerrar */}
                <button
                    onClick={closeByButton}
                    className="absolute top-6 right-6 p-2 rounded-full bg-[#3A4031]/10 text-[#3A4031] hover:bg-[#3A4031] hover:text-white transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Lado Imagen/Diseño */}
                    <div className="md:col-span-5 bg-[#4A5D45] p-10 flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-20 h-20 bg-[#A3B18A] rounded-full flex items-center justify-center shadow-inner">
                            <Landmark className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[40px] font-serif font-bold text-[#F5F5F0] leading-none">10%</span>
                            <span className="block text-[10px] font-black text-[#A3B18A] uppercase tracking-[0.2em]">Off Extra</span>
                        </div>
                    </div>

                    {/* Lado Contenido */}
                    <div className="md:col-span-7 p-10 flex flex-col justify-center text-left">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-[#A3B18A]" />
                            <span className="text-[10px] font-bold text-[#A3B18A] uppercase tracking-[0.3em]">Beneficio Di Rosa</span>
                        </div>

                        <h2 className="text-3xl font-bold text-[#3A4031] leading-tight mb-4 uppercase tracking-tighter">
                            Tu primera <br />
                            <span className="font-serif italic font-light lowercase text-[#4A5D45]">experiencia magistral</span>
                        </h2>

                        <p className="text-sm text-[#5B6350] mb-8 leading-relaxed font-light italic">
                            Aprovechá un <span className="font-bold">10% de descuento automático</span> abonando con transferencia bancaria en toda nuestra tienda.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={closeByButton}
                                className="w-full bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-2xl py-7 font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all"
                            >
                                Empezar a comprar
                            </Button>
                            <p className="text-[9px] text-center text-[#A3B18A] font-bold uppercase tracking-widest">
                                Acumulable con otras promociones
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}