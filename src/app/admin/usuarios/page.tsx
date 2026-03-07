export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input" // ✅ Importado
import { Button } from "@/components/ui/button" // ✅ Importado
import { User as UserIcon, ShoppingBag, Tag, Mail, Search, Users, Star } from "lucide-react"
import UserTagButton from "@/components/admin/UserTagButton"

interface UsuariosPageProps {
    searchParams: Promise<{
        search?: string
    }>
}

interface UserTagButtonProps {
    userId: any
    currentTag: string | null
}

export default async function UsuariosAdminPage({ searchParams }: UsuariosPageProps) {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any

    if (!session || userSession?.role !== "ADMIN") {
        redirect("/mi-cuenta/login")
    }

    const params = await searchParams
    const query = params.search ?? ""

    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    // Filtro de búsqueda
    const where: any = {}
    if (query) {
        where.OR = [
            { nombre: { contains: query, mode: 'insensitive' } },
            { apellido: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
        ]
    }

    const usuarios = await prisma.user.findMany({
        where,
        include: {
            _count: {
                select: {
                    pedidos: {
                        where: { estado: { notIn: ["cancelado", "cancelled_expired"] } }
                    }
                }
            },
            pedidos: {
                where: {
                    createdAt: { gte: inicioMes },
                    estado: { notIn: ["cancelado", "cancelled_expired"] }
                },
                select: { total: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="container mx-auto px-4 py-10 space-y-8 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight italic">Gestión de Clientes</h1>
                    <p className="text-gray-500 text-sm italic">Base de datos y segmentación profesional</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Card className="px-4 py-3 border-[#E9E9E0] bg-white shadow-sm flex flex-col justify-center min-w-[140px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-3 h-3 text-[#A3B18A]" />
                            <div className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Total Usuarios</div>
                        </div>
                        <div className="text-xl font-bold text-gray-700">{usuarios.length}</div>
                    </Card>
                    <Card className="px-4 py-3 border-[#E9E9E0] bg-white shadow-sm flex flex-col justify-center min-w-[140px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="w-3 h-3 text-amber-400" />
                            <div className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Profesionales</div>
                        </div>
                        <div className="text-xl font-bold text-gray-700">
                            {usuarios.filter(u => u.tags === 'PROFESIONAL').length}
                        </div>
                    </Card>
                </div>
            </div>

            {/* BUSCADOR */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <form className="relative flex-1 group max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#4A5D45]" />
                    <Input
                        name="search"
                        placeholder="Buscar por nombre o email..."
                        defaultValue={query}
                        className="pl-10 border-[#E9E9E0] focus-visible:ring-[#4A5D45] rounded-xl"
                    />
                </form>
            </div>

            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="text-[11px] uppercase tracking-wider font-black text-gray-400">Cliente</TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-black text-gray-400">Registro</TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-black text-gray-400 text-center">Historial</TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-black text-gray-400 text-center">Este Mes</TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-black text-gray-400">Etiqueta</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.map((u) => {
                                const pedidosTotales = u._count.pedidos
                                const pedidosMes = u.pedidos.length
                                const gastoMes = u.pedidos.reduce((acc, p) => acc + p.total, 0)

                                const esNuevoRegistro = (ahora.getTime() - new Date(u.createdAt).getTime()) < (1000 * 60 * 60 * 24 * 30)

                                return (
                                    <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                                        <TableCell>
                                            <div className="flex flex-col min-w-[180px]">
                                                {/* ✅ CORREGIDO: u.nombre en lugar de u.name */}
                                                <span className="font-bold text-gray-800 leading-tight">
                                                    {u.nombre || 'S/N'} {u.apellido || ''}
                                                </span>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3 text-[#A3B18A]" /> {u.email}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] text-gray-600 font-medium tracking-tight">
                                                    {new Date(u.createdAt).toLocaleDateString("es-AR")}
                                                </span>
                                                {esNuevoRegistro && (
                                                    <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter italic">Nuevo</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <Badge variant="outline" className="font-bold text-[#4A5D45] border-[#E9E9E0] text-[10px]">
                                                    {pedidosTotales} pedidos
                                                </Badge>
                                                {pedidosTotales === 1 && (
                                                    <span className="text-[8px] text-[#A3B18A] font-black mt-1 uppercase">1ra Compra</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1 font-bold text-gray-700 text-[11px]">
                                                    <ShoppingBag className="w-3 h-3 text-[#A3B18A]" /> {pedidosMes}
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-medium italic">
                                                    ${gastoMes.toLocaleString("es-AR")}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge className={`text-[9px] font-black border-none px-2 py-0.5 rounded-md ${u.tags === 'PROFESIONAL'
                                                ? "bg-[#4A5D45] text-white"
                                                : "bg-gray-100 text-gray-400"
                                                }`}>
                                                {u.tags || 'CLIENTE FINAL'}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <UserTagButton
                                                userId={u.id}
                                                currentTag={u.tags}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}