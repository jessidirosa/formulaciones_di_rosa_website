"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function pad2(n: number) {
    return String(n).padStart(2, "0")
}

export default function VentasProductosClient() {
    const now = new Date()
    const [year, setYear] = useState<number>(now.getFullYear())
    const [month, setMonth] = useState<number>(now.getMonth() + 1)

    // filtros estado
    const [estadoMode, setEstadoMode] = useState<"exclude_cancelled" | "all" | "only">("exclude_cancelled")
    const [estadoOnly, setEstadoOnly] = useState<string>("pagado")

    const url = useMemo(() => {
        const base = `/api/admin/reportes/ventas-productos?year=${year}&month=${month}&format=csv&estadoMode=${estadoMode}`
        if (estadoMode === "only") return `${base}&estado=${encodeURIComponent(estadoOnly)}`
        return base
    }, [year, month, estadoMode, estadoOnly])

    const download = () => {
        // fuerza descarga por content-disposition
        window.location.href = url
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                    <label className="text-sm text-gray-700">Año</label>
                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[year - 2, year - 1, year, year + 1].map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm text-gray-700">Mes</label>
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }).map((_, i) => {
                                const m = i + 1
                                return (
                                    <SelectItem key={m} value={String(m)}>
                                        {pad2(m)}
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm text-gray-700">Filtro de estado</label>
                    <Select value={estadoMode} onValueChange={(v) => setEstadoMode(v as any)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="exclude_cancelled">Excluir cancelados</SelectItem>
                            <SelectItem value="all">Todos (sin filtro)</SelectItem>
                            <SelectItem value="only">Solo un estado…</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {estadoMode === "only" ? (
                    <div>
                        <label className="text-sm text-gray-700">Estado</label>
                        <Select value={estadoOnly} onValueChange={(v) => setEstadoOnly(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Ajustá estos valores a los estados reales que uses */}
                                <SelectItem value="pagado">pagado</SelectItem>
                                <SelectItem value="pendiente">pendiente</SelectItem>
                                <SelectItem value="enviado">enviado</SelectItem>
                                <SelectItem value="entregado">entregado</SelectItem>
                                <SelectItem value="cancelado">cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <div />
                )}
            </div>

            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={download}>
                Descargar CSV del período
            </Button>

            <p className="text-xs text-gray-500">
                Se exporta 1 fila por producto con cantidad total y ventas totales del mes seleccionado.
            </p>
        </div>
    )
}
