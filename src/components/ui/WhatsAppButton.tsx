"use client"

import { Phone } from 'lucide-react'

export default function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/541137024467"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] hover:scale-110 transition-all active:scale-95 group"
            aria-label="Contactar por WhatsApp"
        >
            {/* Tooltip sutil que aparece al pasar el mouse */}
            <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#3A4031] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                ¿Consultas magistrales?
            </span>
            <Phone className="w-6 h-6 fill-current" />
        </a>
    )
}