'use client'

import { useEffect, useState } from 'react'
import { Calendar, Loader2 } from 'lucide-react'

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
        <span>Calculando despacho...</span>
      </div>
    )
  }

  if (!rango) return null

  return (
    <div className="flex items-center gap-2 text-[#A3B18A] text-[10px] font-bold uppercase tracking-widest bg-[#A3B18A]/5 px-3 py-1.5 rounded-full border border-[#A3B18A]/10">
      <Calendar className="w-3 h-3" />
      <span>Finalización estimada: <span className="text-[#4A5D45]">{rango}</span></span>
    </div>
  )
}