export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Fragment } from "react"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import EstadoPedidoSelect from "@/components/admin/EstadoPedidoSelect"
import ConfirmarPedidoButton from '@/components/admin/ConfirmarPedidoButton'
import DespacharAccionesWrapper from "@/components/admin/DespacharAccionesWrapper"
import { sendEmail } from "@/lib/email"
import { emailPagoExpirado } from "@/lib/emailTemplates"
import { Printer, Search, MessageSquare, User } from "lucide-react"
import PedidosFiltros from "@/components/admin/PedidosFiltros"

interface PedidosPageProps {
    searchParams: Promise<{
        search?: string
        estado?: string
        desde?: string
        hasta?: string
    }>
}

export default async function PedidosPage({ searchParams }: PedidosPageProps) {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session || user?.role !== "ADMIN") {
        redirect("/mi-cuenta/login")
    }

    const params = await searchParams
    const search = params.search ?? ""
    const estado = params.estado ?? "todos"
    const desde = params.desde ?? ""
    const hasta = params.hasta ?? ""

    const now = new Date()
    const pedidosAExpirar = await prisma.pedido.findMany({
        where: {
            metodoPago: "TRANSFERENCIA",
            estado: "pending_payment_transfer",
            expiresAt: { lt: now },
        },
    })

    if (pedidosAExpirar.length > 0) {
        for (const p of pedidosAExpirar) {
            if (p.emailCliente) {
                try {
                    await sendEmail(
                        p.emailCliente,
                        `⏳ Tu pedido #${p.numero} ha expirado`,
                        emailPagoExpirado({
                            nombre: p.nombreCliente || undefined,
                            pedidoNumero: p.numero
                        })
                    )
                } catch (e) {
                    console.error("Error enviando mail de expiración:", e)
                }
            }
        }
        await prisma.pedido.updateMany({
            where: { id: { in: pedidosAExpirar.map(p => p.id) } },
            data: { estado: "cancelled_expired" },
        })
    }

    const where: any = {}
    if (search) {
        const searchUpper = search.toUpperCase();
        where.OR = [
            { numero: { contains: searchUpper } },
            { numero: { contains: `P-${searchUpper}` } },
            { nombreCliente: { contains: search, mode: 'insensitive' } },
            { apellidoCliente: { contains: search, mode: 'insensitive' } },
            { emailCliente: { contains: search, mode: 'insensitive' } }
        ]
    }
    if (estado !== "todos") {
        where.estado = estado
    }
    if (desde || hasta) {
        where.createdAt = {}
        if (desde) where.createdAt.gte = new Date(desde)
        if (hasta) {
            const hastaDate = new Date(hasta)
            hastaDate.setHours(23, 59, 59, 999)
            where.createdAt.lte = hastaDate
        }
    }

    const pedidos = await prisma.pedido.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        include: { items: true, user: true },
    })

    await prisma.pedido.updateMany({
        where: { adminSeenAt: null },
        data: { adminSeenAt: new Date() },
    })

    const totalPedidos = pedidos.length
    const totalFacturado = pedidos.reduce((acc: number, p) => acc + p.total, 0)

    return (
        <div className="container mx-auto px-4 py-10 space-y-8 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Panel de Pedidos</h1>
                    <p className="text-gray-500 text-sm">Gestioná las órdenes y envíos</p>
                </div>
                <div className="flex gap-3">
                    <Card className="px-4 py-2 border-gray-100 shadow-sm">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Total Hoy</div>
                        <div className="text-xl font-bold text-[#4A5D45]">{totalPedidos}</div>
                    </Card>
                    <Card className="px-4 py-2 border-gray-100 shadow-sm">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Facturación</div>
                        <div className="text-xl font-bold text-[#4A5D45]">${totalFacturado.toLocaleString("es-AR")}</div>
                    </Card>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4">
                <form className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#4A5D45] transition-colors" />
                    <Input
                        name="search"
                        placeholder="Buscar por código, nombre o email..."
                        defaultValue={search}
                        className="pl-10 border-[#E9E9E0] focus-visible:ring-[#4A5D45] rounded-xl"
                    />
                    <button type="submit" className="hidden" />
                </form>
                <PedidosFiltros currentEstado={estado} />
            </div>

            <Card className="border-gray-200 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-700">Listado de Órdenes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>N° Pedido</TableHead>
                                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                                    <TableHead>Estado / Gestión</TableHead>
                                    <TableHead className="hidden lg:table-cell">Logística</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pedidos.map((pedido) => (
                                    <Fragment key={pedido.id}>
                                        <TableRow className="border-t-2 border-gray-100">
                                            <TableCell className="font-bold text-[#4A5D45] whitespace-nowrap">{pedido.numero}</TableCell>
                                            <TableCell className="text-xs hidden md:table-cell whitespace-nowrap">
                                                {new Date(pedido.createdAt).toLocaleString("es-AR")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2 min-w-[150px]">
                                                    <EstadoPedidoSelect
                                                        key={`${pedido.id}-${pedido.estado}`}
                                                        pedidoId={pedido.id}
                                                        estadoActual={pedido.estado}
                                                    />
                                                    <div className="flex flex-wrap gap-2">
                                                        <ConfirmarPedidoButton pedidoId={Number(pedido.id)} />
                                                        <DespacharAccionesWrapper pedido={pedido} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="capitalize text-xs font-medium">{pedido.metodoEnvio}</span>
                                                    {pedido.carrier && (
                                                        <Badge variant="outline" className="w-fit text-[9px] font-bold border-[#A3B18A] text-[#4A5D45]">
                                                            {pedido.carrier.replace('_', ' ')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold whitespace-nowrap">${pedido.total.toLocaleString("es-AR")}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/pedido/${pedido.publicToken}`}>Ver</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        <TableRow className="bg-gray-50/50">
                                            <TableCell colSpan={6} className="py-4 px-4 md:px-8">
                                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">

                                                    {/* CLIENTE: Se usó flex-wrap y break-words para evitar que se pisen los textos */}
                                                    <div className="space-y-3 min-w-0">
                                                        <div className="text-[10px] font-bold text-[#4A5D45] uppercase tracking-widest border-b pb-1 flex items-center gap-1">
                                                            <User className="w-3 h-3" /> Datos del Cliente
                                                        </div>
                                                        <div className="text-[11px] space-y-1.5 text-gray-700 break-words">
                                                            <p className="flex gap-1 flex-wrap"><span className="text-gray-400 font-medium">Nombre:</span> <span>{pedido.nombreCliente} {pedido.apellidoCliente}</span></p>
                                                            {pedido.dniCliente && <p className="flex gap-1 flex-wrap"><span className="text-gray-400 font-medium">DNI:</span> {pedido.dniCliente}</p>}
                                                            <p className="flex gap-1 flex-wrap"><span className="text-gray-400 font-medium">Email:</span> <span className="text-[#4A5D45] font-semibold">{pedido.emailCliente}</span></p>
                                                            <p className="flex gap-1 flex-wrap"><span className="text-gray-400 font-medium">Tel:</span> {pedido.telefonoCliente}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 min-w-0">
                                                        <div className="text-[10px] font-bold text-[#4A5D45] uppercase tracking-widest border-b pb-1">Logística</div>
                                                        <div className="text-[11px] space-y-1.5 text-gray-700 break-words">
                                                            {pedido.direccion && <p><span className="text-gray-400 font-medium">Dirección:</span> {pedido.direccion}</p>}
                                                            <p><span className="text-gray-400 font-medium">Ubicación:</span> {pedido.localidad || pedido.ciudad}, {pedido.provincia} ({pedido.codigoPostal})</p>
                                                            {pedido.sucursalNombre && (
                                                                <div className="mt-2 p-2 bg-[#F9F9F7] border border-[#E9E9E0] rounded-lg">
                                                                    <p className="text-[#4A5D45] font-bold uppercase text-[9px]">Sucursal:</p>
                                                                    <p className="font-semibold leading-tight">{pedido.sucursalNombre}</p>
                                                                </div>
                                                            )}
                                                            {pedido.notasCliente && (
                                                                <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg flex gap-2">
                                                                    <MessageSquare className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-amber-800 italic leading-snug font-medium">"{pedido.notasCliente}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 min-w-0">
                                                        <div className="text-[10px] font-bold text-[#4A5D45] uppercase tracking-widest border-b pb-1">Productos</div>
                                                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-2">
                                                            {pedido.items.map((item) => (
                                                                <div key={item.id} className="flex justify-between text-[11px] border-b border-gray-50 pb-1 gap-2">
                                                                    <span className="text-gray-700 truncate">{item.nombreProducto} <span className="text-[#A3B18A] font-bold">x{item.cantidad}</span></span>
                                                                    <span className="font-semibold text-gray-900 flex-shrink-0">${item.subtotal.toLocaleString("es-AR")}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="pt-1 flex justify-between text-[11px] font-bold text-[#4A5D45]">
                                                            <span>TOTAL FINAL</span>
                                                            <span>${pedido.total.toLocaleString("es-AR")}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}