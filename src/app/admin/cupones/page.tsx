import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Ticket } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = 'force-dynamic';

// ✅ IMPORTANTE: Importamos los componentes de acción
import BotonEstadoCupon from "@/components/admin/BotonEstadoCupon"
import BotonEliminarCupon from "@/components/admin/BotonEliminarCupon"

export default async function AdminCuponesPage() {
    const cupones = await prisma.cupon.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="container mx-auto px-4 py-10 space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Cupones de Descuento</h1>
                    <p className="text-gray-500 text-sm">Administrá las campañas promocionales de la tienda.</p>
                </div>
                <Link href="/admin/cupones/nuevo">
                    <Button className="bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest px-8">
                        <Plus className="w-4 h-4 mr-2" /> Nuevo Cupón
                    </Button>
                </Link>
            </div>

            <Card className="border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold text-[10px] uppercase text-[#A3B18A]">Código</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-[#A3B18A]">Descuento</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-[#A3B18A]">Uso / Límite</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-[#A3B18A]">Vencimiento</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-[#A3B18A]">Estado</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase text-[#A3B18A]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cupones.map((cupon) => {
                                const isExpired = cupon.fechaVencimiento && new Date() > new Date(cupon.fechaVencimiento);
                                return (
                                    <TableRow key={cupon.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-bold text-[#4A5D45]">
                                            <div className="flex items-center gap-2 text-sm italic">
                                                <Ticket className="w-3 h-3" /> {cupon.codigo}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-semibold">
                                            {cupon.tipo === 'PORCENTAJE' ? `${cupon.valor}%` : `$${cupon.valor.toLocaleString('es-AR')}`}
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            <span className="font-bold text-gray-700">{cupon.usos}</span> / {cupon.limiteUsos || '∞'}
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {cupon.fechaVencimiento ? (
                                                <span className={isExpired ? "text-red-500 font-bold" : ""}>
                                                    {format(new Date(cupon.fechaVencimiento), "dd MMM yyyy", { locale: es })}
                                                </span>
                                            ) : (
                                                <span className="text-[#A3B18A] font-medium italic">♾ Permanente</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${cupon.activo && !isExpired ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                {cupon.activo && !isExpired ? "Activo" : isExpired ? "Expirado" : "Inactivo"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                {/* ✅ Botón para Activar/Desactivar (Power Icon) */}
                                                <BotonEstadoCupon
                                                    cuponId={cupon.id}
                                                    activo={cupon.activo}
                                                />

                                                {/* ✅ Botón para Eliminar (Trash Icon) */}
                                                <BotonEliminarCupon
                                                    cuponId={cupon.id}
                                                    codigo={cupon.codigo}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {cupones.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-400 italic text-sm">
                                        No hay cupones creados aún. Comenzá creando uno nuevo.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}