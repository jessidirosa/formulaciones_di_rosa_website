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
import { Printer, Search, MessageSquare } from "lucide-react"
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

    // --- LÓGICA DE EXPIRACIÓN ---
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

    // --- FILTROS DE BÚSQUEDA ---
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
                        placeholder="Buscar por código (ej: BK92P), nombre o email..."
                        defaultValue={search}
                        className="pl-10 border-[#E9E9E0] focus-visible:ring-[#4A5D45] rounded-xl"
                    />
                    <button type="submit" className="hidden" />
                </form>
                <PedidosFiltros currentEstado={estado} />
            </div>

            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-700">Listado de Órdenes</CardTitle>
                </CardHeader>
                <CardContent>
                    {pedidos.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center py-10">No se encontraron pedidos.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>N° Pedido</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado / Gestión</TableHead>
                                    <TableHead>Método envío</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pedidos.map((pedido) => (
                                    <Fragment key={pedido.id}>
                                        <TableRow className="border-t-2 border-gray-100">
                                            <TableCell className="font-bold text-[#4A5D45]">{pedido.numero}</TableCell>
                                            <TableCell className="text-xs">{new Date(pedido.createdAt).toLocaleString("es-AR")}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    <EstadoPedidoSelect
                                                        key={`${pedido.id}-${pedido.estado}`} // ✅ Esto obliga a React a actualizarse si el estado cambia
                                                        pedidoId={pedido.id}
                                                        estadoActual={pedido.estado}
                                                    />
                                                    <div className="flex flex-wrap gap-2">
                                                        {/* Pasamos el ID forzando que sea el número incremental de la DB */}
                                                        <ConfirmarPedidoButton pedidoId={Number(pedido.id)} />

                                                        {/* Si tenés el wrapper de despacho, hacé lo mismo */}
                                                        <DespacharAccionesWrapper pedido={pedido} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="capitalize text-xs font-medium">{pedido.metodoEnvio}</span>
                                                    {pedido.carrier && (
                                                        <Badge variant="outline" className="w-fit text-[9px] font-bold border-[#A3B18A] text-[#4A5D45]">
                                                            {pedido.carrier.replace('_', ' ')}
                                                        </Badge>
                                                    )}
                                                    {pedido.labelUrl && (
                                                        <a href={pedido.labelUrl} target="_blank" className="flex items-center gap-1 text-[9px] font-bold text-[#4A5D45] hover:underline mt-1">
                                                            <Printer className="w-3 h-3" /> IMPRIMIR RÓTULO
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold">${pedido.total.toLocaleString("es-AR")}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/pedido/${pedido.publicToken}`}>Ver</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        <TableRow className="bg-gray-50/50">
                                            <TableCell colSpan={6} className="py-4 px-8">
                                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">

                                                    {/* COLUMNA 1: DATOS PERSONALES */}
                                                    <div className="space-y-3">
                                                        <div className="text-[10px] font-bold text-[#4A5D45] uppercase tracking-widest border-b pb-1">Cliente</div>
                                                        <div className="text-[11px] space-y-1.5 text-gray-700">
                                                            <p><span className="text-gray-400 font-medium">Nombre:</span> {pedido.nombreCliente} {pedido.apellidoCliente}</p>
                                                            {pedido.dniCliente && <p><span className="text-gray-400 font-medium">DNI:</span> {pedido.dniCliente}</p>}
                                                            <p><span className="text-gray-400 font-medium">Email:</span> {pedido.emailCliente}</p>
                                                            <p><span className="text-gray-400 font-medium">Tel:</span> {pedido.telefonoCliente}</p>
                                                        </div>
                                                    </div>

                                                    {/* COLUMNA 2: DATOS DE ENVÍO Y NOTAS */}
                                                    <div className="space-y-3">
                                                        <div className="text-[10px] font-bold text-[#4A5D45] uppercase tracking-widest border-b pb-1">Logística y Notas</div>
                                                        <div className="text-[11px] space-y-1.5 text-gray-700">
                                                            {pedido.direccion && <p><span className="text-gray-400 font-medium">Dirección:</span> {pedido.direccion}</p>}
                                                            <p><span className="text-gray-400 font-medium">Localidad/Provincia:</span> {pedido.localidad || pedido.ciudad}, {pedido.provincia}</p>
                                                            {pedido.codigoPostal && <p><span className="text-gray-400 font-medium">C.P.:</span> {pedido.codigoPostal}</p>}

                                                            {pedido.sucursalNombre && (
                                                                <div className="mt-2 p-2 bg-[#F9F9F7] border border-[#E9E9E0] rounded-lg">
                                                                    <p className="text-[#4A5D45] font-bold uppercase text-[9px]">Sucursal Elegida:</p>
                                                                    <p className="font-semibold">{pedido.sucursalNombre}</p>
                                                                    {pedido.sucursalCorreo && <p className="text-[9px] text-gray-400 uppercase">{pedido.sucursalCorreo}</p>}
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

                                                    {/* COLUMNA 3: PRODUCTOS */}
                                                    <div className="space-y-3">
                                                        <div className="text-[10px] font-bold text-[#4A5D45] uppercase tracking-widest border-b pb-1">Detalle de Compra</div>
                                                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-2">
                                                            {pedido.items.map((item) => (
                                                                <div key={item.id} className="flex justify-between text-[11px] border-b border-gray-50 pb-1">
                                                                    <span className="text-gray-700">{item.nombreProducto} <span className="text-[#A3B18A] font-bold">x{item.cantidad}</span></span>
                                                                    <span className="font-semibold text-gray-900">${item.subtotal.toLocaleString("es-AR")}</span>
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}