'use client'

import { useState, useEffect } from 'react'
import {
    CreditCard,
    Landmark,
    Truck,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Award,
    FlaskConical
} from 'lucide-react'
import Link from 'next/link'

const announcements = [
    {
        text: "3 CUOTAS SIN INTERÉS EN TODA LA TIENDA - LLEVÁ LO QUE AMÁS AHORA",
        icon: <CreditCard className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#4A5D45]",
        link: "/tienda"
    },
    {
        text: "10% OFF ABONANDO POR TRANSFERENCIA BANCARIA - APROVECHÁ EL BENEFICIO",
        icon: <Landmark className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#A3B18A]",
        link: "/tienda"
    },
    {
        text: "CREÁ TU PROPIA MARCA MAGISTRAL CON NOSOTROS - ASESORAMIENTO PROFESIONAL",
        icon: <FlaskConical className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#3A4031]",
        link: "/servicios"
    },
    {
        text: "DESCUENTO EXCLUSIVO PARA PROFESIONALES Y REVENDEDORES - SUMATE",
        icon: <Award className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#4A5D45]",
        link: "/servicios"
    },
    {
        text: "USÁ EL CUPÓN 'HOLA2026' Y OBTENÉ $5.000 OFF EXTRA EN TU COMPRA",
        icon: <Sparkles className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#D4A373]",
        link: "/tienda"
    },
    {
        text: "ENVÍOS A TODO EL PAÍS - ANDREANI Y CORREO ARGENTINO - SEGUIMIENTO ONLINE",
        icon: <Truck className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#3A4031]",
        link: "/politicas/envios"
    }
]

export default function AnnouncementBanner() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % announcements.length)
        }, 10000) // ✅ Aumentado a 10 segundos para dar tiempo a leer
        return () => clearInterval(timer)
    }, [])

    return (
        <div className={`${announcements[index].color} text-white transition-colors duration-500 overflow-hidden w-full relative group/banner`}>
            <div className="container mx-auto h-9 flex items-center px-2 md:px-4">

                <button
                    onClick={() => setIndex(index === 0 ? announcements.length - 1 : index - 1)}
                    className="relative z-20 bg-inherit pr-2 hover:scale-110 transition-transform flex-shrink-0"
                >
                    <ChevronLeft className="w-4 h-4 opacity-70 hover:opacity-100" />
                </button>

                <div className="flex-1 overflow-hidden relative h-full flex items-center">
                    <Link
                        href={announcements[index].link}
                        key={index}
                        className="flex items-center gap-4 whitespace-nowrap min-w-full animate-marquee-mobile md:animate-none md:justify-center group-hover/banner:[animation-play-state:paused]"
                    >
                        <div className="flex items-center gap-2 px-4 flex-shrink-0">
                            {announcements[index].icon}
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
                                {announcements[index].text}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 flex-shrink-0 md:hidden">
                            {announcements[index].icon}
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
                                {announcements[index].text}
                            </span>
                        </div>
                    </Link>
                </div>

                <button
                    onClick={() => setIndex((index + 1) % announcements.length)}
                    className="relative z-10 bg-inherit pl-2 hover:scale-110 transition-transform flex-shrink-0"
                >
                    <ChevronRight className="w-4 h-4 opacity-70 hover:opacity-100" />
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marqueeCustom {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-mobile {
                    animation: marqueeCustom 25s linear infinite; /* ✅ Ralentizado a 25s */
                }
            `}} />
        </div>
    )
}