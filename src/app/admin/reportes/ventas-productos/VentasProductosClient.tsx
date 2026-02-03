"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { FilePieChart, FileSpreadsheet, Download } from "lucide-react"

function pad2(n: number) {
    return String(n).padStart(2, "0")
}

export default function VentasProductosClient() {
    const now = new Date()
    const [year, setYear] = useState<number>(now.getFullYear())
    const [month, setMonth] = useState<number>(now.getMonth() + 1)
    const [estadoMode, setEstadoMode] = useState<"exclude_cancelled" | "all" | "only">("exclude_cancelled")
    const [estadoOnly, setEstadoOnly] = useState<string>("confirmado")

    const handleDownload = (reportType: 'ventas-productos' | 'pedidos-detallados') => {
        // 1. Construimos la URL con los parámetros
        const params = new URLSearchParams({
            year: year.toString(),
            month: month.toString(),
            estadoMode: estadoMode
        });

        if (estadoMode === "only") {
            params.append("estado", estadoOnly);
        }

        const url = `/api/admin/reportes/${reportType}?${params.toString()}`;

        // 2. En lugar de fetch, usamos un link invisible para forzar la descarga
        // Esto evita problemas de CORS y de falta de credenciales en la mayoría de los casos
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', ''); // El nombre lo define el servidor con Content-Disposition
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="space-y-8 text-left">
            {/* Filtros Globales */}
            <Card className="border-[#E9E9E0] bg-white shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[#A3B18A] tracking-wider">Año</label>
                            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[year - 1, year, year + 1].map((y) => (
                                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[#A3B18A] tracking-wider">Mes</label>
                            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>{pad2(i + 1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[#A3B18A] tracking-wider">Filtro de Estado</label>
                            <Select value={estadoMode} onValueChange={(v) => setEstadoMode(v as any)}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="exclude_cancelled">Excluir cancelados</SelectItem>
                                    <SelectItem value="all">Todos (sin filtro)</SelectItem>
                                    <SelectItem value="only">Solo un estado...</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {estadoMode === "only" && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-[#A3B18A] tracking-wider">Estado específico</label>
                                <Select value={estadoOnly} onValueChange={(v) => setEstadoOnly(v)}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="confirmado">Confirmado</SelectItem>
                                        <SelectItem value="pendiente">Pendiente</SelectItem>
                                        <SelectItem value="enviado">Enviado</SelectItem>
                                        <SelectItem value="entregado">Entregado</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Opciones de Exportación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Botón Reporte Productos */}
                <Card className="border-[#E9E9E0] hover:border-[#A3B18A] transition-all rounded-2xl group">
                    <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                            <FilePieChart className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#3A4031] uppercase text-sm tracking-widest">Ventas por Producto</h3>
                            <p className="text-[11px] text-gray-500 mt-2 italic">Cantidad total vendida y facturación agrupada por artículo.</p>
                        </div>
                        <Button
                            onClick={() => handleDownload('ventas-productos')}
                            className="w-full bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest h-12 gap-2"
                        >
                            <Download className="w-4 h-4" /> Exportar Productos
                        </Button>
                    </CardContent>
                </Card>

                {/* Botón Reporte Pedidos */}
                <Card className="border-[#E9E9E0] hover:border-[#A3B18A] transition-all rounded-2xl group">
                    <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <FileSpreadsheet className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#3A4031] uppercase text-sm tracking-widest">Detalle de Pedidos</h3>
                            <p className="text-[11px] text-gray-500 mt-2 italic">Datos de clientes, cupones, envíos y montos totales detallados.</p>
                        </div>
                        <Button
                            onClick={() => handleDownload('pedidos-detallados')}
                            className="w-full bg-[#3A4031] hover:bg-[#2A2E24] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest h-12 gap-2"
                        >
                            <Download className="w-4 h-4" /> Exportar Pedidos
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}