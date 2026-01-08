// src/app/admin/page.tsx 
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Package,
    ShoppingBag,
    Percent,
    Tag,
    BarChart3,
} from "lucide-react"

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session || user?.role !== "ADMIN") {
        redirect("/mi-cuenta/login")
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <div className="flex items-baseline justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Panel de administración</h1>
                    <p className="text-sm text-gray-600">
                        Gestioná pedidos, productos y cupones de Formulaciones Di Rosa.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Pedidos */}
                <Card className="border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Package className="h-5 w-5" />
                            Pedidos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Revisá, actualizá estados y exportá los pedidos realizados en la web.
                        </p>
                        <Link href="/admin/pedidos">
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                Ir a pedidos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Productos */}
                <Card className="border-emerald-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700">
                            <ShoppingBag className="h-5 w-5" />
                            Productos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Creá, editá, activá/desactivá y marcá como destacados los productos.
                        </p>
                        <Link href="/admin/productos">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                Ir a productos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Cupones (placeholder para después) */}
                <Card className="border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Percent className="h-5 w-5" />
                            Cupones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Próximamente vas a poder crear cupones de descuento para campañas.
                        </p>
                        <Button className="w-full" variant="outline" disabled>
                            Próximamente
                        </Button>
                    </CardContent>
                </Card>

                {/* Categorías */}
                <Card className="border-purple-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <Tag className="h-5 w-5" />
                            Categorías
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Administrá las categorías que podés asignar a cada producto.
                        </p>
                        <Link href="/admin/categorias">
                            <Button className="w-full" variant="outline">
                                Gestionar categorías
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Reportes de ventas por producto */}
                <Card className="border-amber-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <BarChart3 className="h-5 w-5" />
                            Reportes de ventas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Exportá ventas por producto en CSV, filtrando por período y estado.
                        </p>
                        <Link href="/admin/reportes/ventas-productos">
                            <Button className="w-full" variant="outline">
                                Ir al reporte
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
