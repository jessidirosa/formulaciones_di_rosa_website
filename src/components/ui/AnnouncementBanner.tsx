'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Landmark, Truck, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'

const announcements = [
    {
        text: "3 CUOTAS SIN INTERÉS EN TODA LA TIENDA",
        icon: <CreditCard className="w-3 h-3" />,
        color: "bg-[#4A5D45]"
    },
    {
        text: "10% OFF EXTRA ABONANDO POR TRANSFERENCIA",
        icon: <Landmark className="w-3 h-3" />,
        color: "bg-[#A3B18A]"
    },
    {
        text: "USÁ EL CUPÓN 'HOLA2026' Y OBTENÉ $5.000 OFF EXTRA",
        icon: <Sparkles className="w-3 h-3" />,
        color: "bg-[#D4A373]" // Un tono bronce/dorado para que resalte
    },
    {
        text: "ENVÍOS A TODO EL PAÍS - ANDREANI Y CORREO ARGENTINO",
        icon: <Truck className="w-3 h-3" />,
        color: "bg-[#3A4031]"
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
                <button onClick={() => setIndex(index === 0 ? announcements.length - 1 : index - 1)} className="hover:scale-110 transition-transform">
                    <ChevronLeft className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>

                <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                    {announcements[index].icon}
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                        {announcements[index].text}
                    </span>
                </div>

                <button onClick={() => setIndex((index + 1) % announcements.length)} className="hover:scale-110 transition-transform">
                    <ChevronRight className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>
            </div>
        </div>
    )
}