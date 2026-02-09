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
        text: "3 CUOTAS SIN INTERÉS EN TODA LA TIENDA",
        icon: <CreditCard className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#4A5D45]",
        link: "/tienda"
    },
    {
        text: "10% OFF POR TRANSFERENCIA",
        icon: <Landmark className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#A3B18A]",
        link: "/tienda"
    },
    {
        text: "CREÁ TU PROPIA MARCA MAGISTRAL",
        icon: <FlaskConical className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#3A4031]",
        link: "/servicios"
    },
    {
        text: "DESCUENTO PARA PROFESIONALES",
        icon: <Award className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#4A5D45]",
        link: "/servicios"
    },
    {
        text: "CUPÓN 'HOLA2026': $5.000 OFF",
        icon: <Sparkles className="w-3 h-3 flex-shrink-0" />,
        color: "bg-[#D4A373]",
        link: "/tienda"
    },
    {
        text: "ENVÍOS A TODO EL PAÍS",
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
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className={`${announcements[index].color} text-white transition-colors duration-500 overflow-hidden w-full`}>
            <div className="container mx-auto h-9 flex items-center justify-between px-2 md:px-4">
                <button
                    onClick={() => setIndex(index === 0 ? announcements.length - 1 : index - 1)}
                    className="hover:scale-110 transition-transform p-1 flex-shrink-0"
                >
                    <ChevronLeft className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>

                <div className="flex-1 overflow-hidden flex justify-center mx-2">
                    <Link
                        href={announcements[index].link}
                        key={index}
                        className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500 hover:opacity-90 transition-opacity cursor-pointer max-w-full"
                    >
                        {announcements[index].icon}
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis">
                            {announcements[index].text}
                        </span>
                    </Link>
                </div>

                <button
                    onClick={() => setIndex((index + 1) % announcements.length)}
                    className="hover:scale-110 transition-transform p-1 flex-shrink-0"
                >
                    <ChevronRight className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>
            </div>
        </div>
    )
}