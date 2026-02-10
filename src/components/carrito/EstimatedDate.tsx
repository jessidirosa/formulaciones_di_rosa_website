'use client'

import { useEffect, useState } from 'react'
import { Calendar, Loader2, Sparkles } from 'lucide-react'

export default function EstimatedDate() {
  const [rango, setRango] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Consultamos a la API centralizada
    fetch('/api/capacity/estimated-date')
      .then(res => res.json())
      .then(data => {
        setRango(data.rangoTexto)
      })
      .catch(err => console.error("Error cargando fecha:", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#A3B18A] text-[10px] font-bold uppercase tracking-widest animate-pulse">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Calculando fecha de finalización...</span>
      </div>
    )
  }

  if (!rango) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[#A3B18A] text-[11px] font-bold uppercase tracking-widest bg-[#A3B18A]/10 px-4 py-2.5 rounded-2xl border border-[#A3B18A]/20 w-fit">
        <Calendar className="w-4 h-4" />
        <span>Finalización estimada: <span className="text-[#4A5D45] underline decoration-2 underline-offset-4">{rango}</span></span>
      </div>

      <div className="flex items-start gap-2 px-1">
        <Sparkles className="w-3 h-3 text-[#A3B18A] mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-[#5B6350] leading-relaxed italic font-medium">
          Cada producto es formulado y elaborado específicamente para vos, respetando los tiempos de maduración magistral.
        </p>
      </div>
    </div>
  )
}