import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

interface EstimatedDateProps {
  fechaEstimada: string | null
}

export default function EstimatedDate({ fechaEstimada }: EstimatedDateProps) {
  if (!fechaEstimada) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 text-blue-700">
          <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm mb-1">
              Fecha estimada de envío/retiro
            </p>
            <p className="text-lg font-semibold">
              {fechaEstimada}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <Clock className="h-3 w-3" />
              <span>
                Calculado según nuestra capacidad de producción actual
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}