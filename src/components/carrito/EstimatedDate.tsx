import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, FlaskConical } from 'lucide-react'

interface EstimatedDateProps {
  fechaEstimada: string | null
}

export default function EstimatedDate({ fechaEstimada }: EstimatedDateProps) {
  if (!fechaEstimada) {
    return null
  }

  return (
    <Card className="border-none shadow-sm bg-[#E9E9E0] overflow-hidden rounded-2xl relative">
      {/* Detalle decorativo sutil: probeta de fondo */}
      <FlaskConical className="absolute -right-2 -bottom-2 h-16 w-16 text-[#A3B18A] opacity-10 rotate-12" />

      <CardContent className="p-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="bg-[#4A5D45] p-2.5 rounded-xl shadow-sm">
            <Calendar className="h-5 w-5 text-[#F5F5F0]" />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A]">
              Compromiso de Preparación
            </p>
            <h4 className="text-[#3A4031] font-bold text-sm leading-tight">
              Fecha estimada de despacho/retiro
            </h4>

            <div className="pt-2">
              <span className="text-2xl font-serif font-bold text-[#4A5D45]">
                {fechaEstimada}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-3 text-[10px] text-[#5B6350] font-medium italic border-t border-[#D6D6C2] mt-2">
              <Clock className="h-3 w-3 text-[#A3B18A]" />
              <span>
                Sujeto a los tiempos de elaboración de nuestras fórmulas exclusivas.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}