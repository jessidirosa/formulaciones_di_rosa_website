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
        icon: <CreditCard className="w-3 h-3" />,
        color: "bg-[#4A5D45]",
        link: "/tienda"
    },
    {
        text: "10% OFF ABONANDO POR TRANSFERENCIA",
        icon: <Landmark className="w-3 h-3" />,
        color: "bg-[#A3B18A]",
        link: "/tienda"
    },
    {
        text: "CREÁ TU PROPIA MARCA MAGISTRAL CON NOSOTROS",
        icon: <FlaskConical className="w-3 h-3" />,
        color: "bg-[#3A4031]",
        link: "/servicios"
    },
    {
        text: "DESCUENTO EXCLUSIVO PARA PROFESIONALES",
        icon: <Award className="w-3 h-3" />,
        color: "bg-[#4A5D45]",
        link: "/servicios"
    },
    {
        text: "USÁ EL CUPÓN 'HOLA2026' Y OBTENÉ $5.000 OFF EXTRA",
        icon: <Sparkles className="w-3 h-3" />,
        color: "bg-[#D4A373]",
        link: "/tienda"
    },
    {
        text: "ENVÍOS A TODO EL PAÍS - ANDREANI Y CORREO ARGENTINO",
        icon: <Truck className="w-3 h-3" />,
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
        <div className={`${announcements[index].color} text-white transition-colors duration-500 overflow-hidden`}>
            <div className="container mx-auto h-9 flex items-center justify-between px-4">
                <button
                    onClick={() => setIndex(index === 0 ? announcements.length - 1 : index - 1)}
                    className="hover:scale-110 transition-transform p-1"
                >
                    <ChevronLeft className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>

                <Link
                    href={announcements[index].link}
                    key={index}
                    className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500 hover:opacity-90 transition-opacity cursor-pointer"
                >
                    {announcements[index].icon}
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                        {announcements[index].text}
                    </span>
                </Link>

                <button
                    onClick={() => setIndex((index + 1) % announcements.length)}
                    className="hover:scale-110 transition-transform p-1"
                >
                    <ChevronRight className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>
            </div>
        </div>
    )
}