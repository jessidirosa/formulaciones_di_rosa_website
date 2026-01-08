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
            <div>
                <h1 className="text-2xl font-semibold">
                    Reporte de ventas por producto
                </h1>
                <p className="text-sm text-gray-600">
                    Visualizá la cantidad vendida y el total facturado por producto, mes a mes.
                </p>
            </div>

            <VentasProductosClient />
        </div>
    )
}
