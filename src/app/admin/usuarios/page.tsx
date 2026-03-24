export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Mail, Search, Users, Star, ArrowUpDown, Download } from "lucide-react"
import UserTagButton from "@/components/admin/UserTagButton"
import ExportUsersButton from "@/components/admin/ExportUsersButton" // ✅ Componente nuevo que crearemos

interface UsuariosPageProps {
    searchParams: Promise<{
        search?: string
        sort?: 'nombre' | 'pedidos' | 'recientes' | 'antiguos'
        tag?: 'PROFESIONAL' | 'CLIENTE' | 'ALL'
    }>
}

export default async function UsuariosAdminPage({ searchParams }: UsuariosPageProps) {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any

    if (!session || userSession?.role !== "ADMIN") {
        redirect("/mi-cuenta/login")
    }

    const params = await searchParams
    const query = params.search ?? ""
    const sort = params.sort ?? "recientes"
    const tagFilter = params.tag ?? "ALL"

    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    // Filtros de búsqueda y etiquetas
    const where: any = {}
    if (query) {
        where.OR = [
            { nombre: { contains: query, mode: 'insensitive' } },
            { apellido: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
        ]
    }

    if (tagFilter === 'PROFESIONAL') where.tags = 'PROFESIONAL'
    if (tagFilter === 'CLIENTE') where.tags = { not: 'PROFESIONAL' }

    // 1. Query a la base de datos
    let usuarios = await prisma.user.findMany({
        where,
        include: {
            _count: {
                select: {
                    pedidos: { where: { estado: { notIn: ["cancelado", "cancelled_expired"] } } }
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
        orderBy: sort === 'nombre' ? { nombre: 'asc' } :
            sort === 'antiguos' ? { createdAt: 'asc' } :
                { createdAt: 'desc' }
    })

    // 2. Orden manual por pedidos
    if (sort === 'pedidos') {
        usuarios = usuarios.sort((a, b) => b._count.pedidos - a._count.pedidos)
    }

    const getQueryString = (overrides: Record<string, string>) => {
        const current = { search: query, sort, tag: tagFilter, ...overrides }
        return new URLSearchParams(current).toString()
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-8 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight italic">Gestión de Clientes</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-gray-500 text-sm italic">Base de datos Di Rosa</p>
                        <ExportUsersButton data={usuarios} /> {/* ✅ Botón de Exportación */}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Card className="px-4 py-3 border-[#E9E9E0] bg-white shadow-sm flex flex-col justify-center min-w-[140px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-3 h-3 text-[#A3B18A]" />
                            <div className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Total</div>
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

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <form className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#4A5D45]" />
                    <Input
                        name="search"
                        placeholder="Buscar cliente..."
                        defaultValue={query}
                        className="pl-10 border-[#E9E9E0] focus-visible:ring-[#4A5D45] rounded-xl"
                    />
                    <input type="hidden" name="sort" value={sort} />
                    <input type="hidden" name="tag" value={tagFilter} />
                </form>

                <div className="flex gap-2">
                    <Link
                        href={`?${getQueryString({ tag: 'ALL' })}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${tagFilter === 'ALL' ? 'bg-[#4A5D45] text-white border-[#4A5D45]' : 'bg-white text-gray-400 border-gray-100'}`}
                    >
                        TODOS
                    </Link>
                    <Link
                        href={`?${getQueryString({ tag: 'PROFESIONAL' })}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${tagFilter === 'PROFESIONAL' ? 'bg-[#4A5D45] text-white border-[#4A5D45]' : 'bg-white text-gray-400 border-gray-100'}`}
                    >
                        PROFESIONALES
                    </Link>
                </div>
            </div>

            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead>
                                    <Link href={`?${getQueryString({ sort: 'nombre' })}`} className="flex items-center gap-1 text-[11px] font-black text-gray-400 hover:text-[#4A5D45] uppercase tracking-wider">
                                        Cliente <ArrowUpDown className="w-3 h-3" />
                                    </Link>
                                </TableHead>
                                <TableHead>
                                    <Link href={`?${getQueryString({ sort: sort === 'recientes' ? 'antiguos' : 'recientes' })}`} className="flex items-center gap-1 text-[11px] font-black text-gray-400 hover:text-[#4A5D45] uppercase tracking-wider">
                                        Fecha Registro <ArrowUpDown className="w-3 h-3" />
                                    </Link>
                                </TableHead>
                                <TableHead className="text-center">
                                    <Link href={`?${getQueryString({ sort: 'pedidos' })}`} className="flex items-center justify-center gap-1 text-[11px] font-black text-gray-400 hover:text-[#4A5D45] uppercase tracking-wider">
                                        Pedidos <ArrowUpDown className="w-3 h-3" />
                                    </Link>
                                </TableHead>
                                <TableHead className="text-[11px] font-black text-gray-400 text-center uppercase tracking-wider">Este Mes</TableHead>
                                <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Categoría</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.map((u) => {
                                const pedidosTotales = u._count.pedidos
                                const pedidosMes = u.pedidos.length
                                const gastoMes = u.pedidos.reduce((acc, p) => acc + (p.total || 0), 0)

                                return (
                                    <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{u.nombre} {u.apellido}</span>
                                                <span className="text-[10px] text-gray-400">{u.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[11px] text-gray-600">
                                            {new Date(u.createdAt).toLocaleDateString("es-AR")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-[#4A5D45] border-[#E9E9E0]">{pedidosTotales}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-bold text-gray-700">{pedidosMes} compras</span>
                                                <span className="text-[9px] text-gray-400">${gastoMes.toLocaleString("es-AR")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`text-[9px] ${u.tags === 'PROFESIONAL' ? "bg-[#4A5D45]" : "bg-gray-100 text-gray-400"}`}>
                                                {u.tags || 'CLIENTE FINAL'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <UserTagButton userId={u.id} currentTag={u.tags} />
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