import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import VentasProductosClient from "./VentasProductosClient"

export default async function VentasProductosPage() {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session || user?.role !== "ADMIN") {
        redirect("/mi-cuenta/login")
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-6">
            <div className="text-left">
                <h1 className="text-3xl font-bold text-[#3A4031]">
                    Centro de Reportes
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                    Seleccioná el período y el filtro de estado para exportar tus datos a Excel.
                </p>
            </div>

            <VentasProductosClient />
        </div>
    )
}