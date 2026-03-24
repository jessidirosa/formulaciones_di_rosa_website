'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function ExportUsersButton({ data }: { data: any[] }) {
    const exportToCSV = () => {
        const headers = ["ID", "Nombre", "Apellido", "Email", "Fecha Registro", "Pedidos Totales", "Tag"]
        const rows = data.map(u => [
            u.id,
            u.nombre || "",
            u.apellido || "",
            u.email,
            new Date(u.createdAt).toLocaleDateString("es-AR"),
            u._count.pedidos,
            u.tags || "CLIENTE FINAL"
        ])

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `clientes_formulaciones_di_rosa_${new Date().toISOString().split('T')[0]}.csv`)
        link.click()
    }

    return (
        <Button
            onClick={exportToCSV}
            variant="ghost"
            size="sm"
            className="text-[#4A5D45] hover:bg-[#E9E9E0] text-[10px] font-bold uppercase gap-2"
        >
            <Download className="w-3 h-3" /> Exportar CSV
        </Button>
    )
}