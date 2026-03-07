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
import { Printer, Search, MessageSquare, User, Calendar, Factory, MapPin, CreditCard, RotateCcw, FastForward, CalendarDays } from "lucide-react"
import PedidosFiltros from "@/components/admin/PedidosFiltros"
import { obtenerResumenCapacidad, formatearFechaArgentina } from "@/lib/capacity"
import BotonSaltoSemana from "@/components/admin/BotonSaltoSemana"
import EditarPedidoModal from "@/components/admin/EditarPedidoModal"

interface PedidosPageProps {
    searchParams: Promise<{
        search?: string
        estado?: string
        desde?: string
        hasta?: string
        mes?: string
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
    const estado = params.estado ?? "activos"
    const mesSeleccionado = params.mes // Puede ser undefined

    const now = new Date()

    // --- LÓGICA DE CAPACIDAD ---
    const resumenCapacidad = await obtenerResumenCapacidad()

    // 1. Lógica de Expiración (Mantenida)
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

    // --- CONSTRUCCIÓN DEL FILTRO UNIFICADO (WHERE) ---
    const where: any = {}

    // Búsqueda
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

    // Estado
    if (estado !== "todos") {
        if (estado === "activos") {
            where.estado = { notIn: ["cancelado", "cancelled_expired"] }
        } else {
            where.estado = estado
        }
    }

    // Filtro de Mes Unificado (Afecta a la tabla y a la facturación)
    if (mesSeleccionado) {
        const anioActual = new Date().getFullYear();
        const inicioMes = new Date(anioActual, parseInt(mesSeleccionado) - 1, 1);
        const finMes = new Date(anioActual, parseInt(mesSeleccionado), 0, 23, 59, 59);
        where.createdAt = { gte: inicioMes, lte: finMes };
    }

    // --- CONSULTA ÚNICA A LA DB ---
    const pedidos = await prisma.pedido.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        include: { items: true, user: true },
    })

    // Actualizar visto (Mantenido)
    await prisma.pedido.updateMany({
        where: { adminSeenAt: null },
        data: { adminSeenAt: new Date() },
    })

    // --- CÁLCULOS SOBRE LOS DATOS FILTRADOS ---
    const totalPedidos = pedidos.length
    const totalFacturado = pedidos.reduce((acc: number, p) => acc + p.total, 0)

    return (
        <div className="container mx-auto px-4 py-10 space-y-8 text-left">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Panel de Pedidos</h1>
                    <p className="text-gray-500 text-sm">Gestioná las órdenes y el flujo del laboratorio</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full md:w-auto">
                    <Card className="px-4 py-3 border-[#D6D6C2] bg-white shadow-sm flex flex-col justify-center min-w-[160px]">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Factory className="w-3 h-3 text-[#A3B18A]" />
                                <div className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Cupos Semanales</div>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-[#4A5D45]">
                            {resumenCapacidad.capacidadDisponible} <span className="text-gray-300 font-light text-sm">/ {resumenCapacidad.capacidadTotal}</span>
                        </div>
                        <BotonSaltoSemana semanasSaltadas={resumenCapacidad.semanasSaltadas} />
                    </Card>

                    <Card className="px-4 py-3 border-[#D6D6C2] bg-white shadow-sm flex flex-col justify-center min-w-[160px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3 h-3 text-[#A3B18A]" />
                            <div className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Próximo Despacho</div>
                        </div>
                        <div className="text-sm font-bold text-[#4A5D45] truncate">
                            {formatearFechaArgentina(resumenCapacidad.proximaFechaEstimada)}
                        </div>
                    </Card>

                    <Card className="px-4 py-3 border-gray-100 bg-gray-50/50 shadow-sm flex flex-col justify-center min-w-[120px]">
                        <div className="text-[9px] uppercase font-black text-gray-400 tracking-wider mb-1">Órdenes en Filtro</div>
                        <div className="text-xl font-bold text-gray-700">{totalPedidos}</div>
                    </Card>

                    <Card className="px-4 py-3 border-gray-100 bg-gray-50/50 shadow-sm flex flex-col justify-center min-w-[160px]">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Facturación Filtro</div>
                            {mesSeleccionado && <Badge variant="outline" className="text-[8px] border-[#A3B18A] text-[#4A5D45]">Mes {mesSeleccionado}</Badge>}
                        </div>
                        <div className="text-xl font-bold text-gray-700">${totalFacturado.toLocaleString("es-AR")}</div>
                        <p className="text-[8px] text-gray-400 italic">{mesSeleccionado ? 'Total del mes' : 'Total del período seleccionado'}</p>
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

            {/* SELECTOR DE MES UNIFICADO CON BOTÓN TODO EL AÑO */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-fit">
                <div className="flex items-center gap-2 px-2 border-r border-gray-100 mr-2">
                    <CalendarDays className="w-4 h-4 text-[#4A5D45]" />
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Período:</span>
                </div>

                <div className="flex flex-wrap gap-1">
                    <Link
                        href={`?${search ? `search=${search}&` : ''}${estado !== 'activos' ? `estado=${estado}` : ''}`}
                        className={`text-[9px] px-3 py-1.5 rounded-lg font-bold transition-all border ${!mesSeleccionado
                                ? "bg-[#4A5D45] text-white border-[#4A5D45]"
                                : "bg-white text-gray-400 border-gray-100 hover:border-[#A3B18A]"
                            }`}
                    >
                        TODO EL AÑO
                    </Link>

                    {[
                        { n: "1", m: "Ene" }, { n: "2", m: "Feb" }, { n: "3", m: "Mar" },
                        { n: "4", m: "Abr" }, { n: "5", m: "May" }, { n: "6", m: "Jun" },
                        { n: "7", m: "Jul" }, { n: "8", m: "Ago" }, { n: "9", m: "Sep" },
                        { n: "10", m: "Oct" }, { n: "11", m: "Nov" }, { n: "12", m: "Dic" }
                    ].map((m) => (
                        <Link
                            key={m.n}
                            href={`?mes=${m.n}${search ? `&search=${search}` : ''}${estado !== 'activos' ? `&estado=${estado}` : ''}`}
                            className={`text-[9px] px-2.5 py-1.5 rounded-lg font-bold transition-all border ${mesSeleccionado === m.n
                                    ? "bg-[#A3B18A] text-white border-[#A3B18A]"
                                    : "bg-white text-gray-400 border-gray-100 hover:border-[#A3B18A]"
                                }`}
                        >
                            {m.m}
                        </Link>
                    ))}
                </div>
            </div>

            <Card className="border-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/30 border-b border-gray-100">
                    <CardTitle className="text-xl font-semibold text-gray-700">Listado de Órdenes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[100px]">Pedido</TableHead>
                                    <TableHead>Estado / Gestión</TableHead>
                                    <TableHead className="hidden sm:table-cell">Logística</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pedidos.map((pedido) => (
                                    <Fragment key={pedido.id}>
                                        <TableRow className="border-t-2 border-gray-100 hover:bg-white">
                                            <TableCell className="font-bold text-[#4A5D45]">
                                                {pedido.numero}
                                                <div className="text-[10px] text-gray-400 font-normal md:hidden">
                                                    {new Date(pedido.createdAt).toLocaleDateString("es-AR")}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    <EstadoPedidoSelect
                                                        key={`${pedido.id}-${pedido.estado}`}
                                                        pedidoId={pedido.id}
                                                        estadoActual={pedido.estado}
                                                    />
                                                    <div className="flex flex-wrap gap-1">
                                                        <ConfirmarPedidoButton pedidoId={Number(pedido.id)} />
                                                        <DespacharAccionesWrapper pedido={pedido} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="capitalize text-[10px] font-medium">{pedido.metodoEnvio}</span>
                                                    {pedido.carrier && (
                                                        <Badge variant="outline" className="w-fit text-[8px] font-bold border-[#A3B18A] text-[#4A5D45]">
                                                            {pedido.carrier.replace('_', ' ')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-gray-700">
                                                ${pedido.total.toLocaleString("es-AR")}
                                            </TableCell>
                                            <TableCell className="text-right flex gap-2 justify-end">
                                                <EditarPedidoModal pedido={pedido} />
                                                <Button variant="outline" size="sm" asChild className="h-8 px-2">
                                                    <Link href={`/pedido/${pedido.publicToken}`}>Ver</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* FILA DE DETALLES AMPLIADA */}
                                        <TableRow className="bg-gray-50/50">
                                            <TableCell colSpan={5} className="py-3 px-4 md:px-8">
                                                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Info Cliente */}
                                                    <div className="space-y-3 min-w-0">
                                                        <div className="text-[10px] font-black text-[#4A5D45] uppercase tracking-widest border-b pb-1 flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5" /> Información del Cliente
                                                        </div>
                                                        <div className="text-[11px] space-y-1.5 text-gray-700">
                                                            <p className="truncate"><span className="text-gray-400 font-medium">Nombre:</span> <span className="font-semibold">{pedido.nombreCliente} {pedido.apellidoCliente}</span></p>
                                                            <p className="break-all"><span className="text-gray-400 font-medium">Email:</span> <span className="text-[#4A5D45] font-semibold">{pedido.emailCliente}</span></p>
                                                            <p><span className="text-gray-400 font-medium">Tel:</span> {pedido.telefonoCliente}</p>
                                                            <div className="pt-2">
                                                                <p className="text-[9px] text-gray-400 uppercase font-bold">Pago: <span className="text-[#4A5D45]">{pedido.metodoPago?.replace('_', ' ') || 'MERCADOPAGO'}</span></p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Logística */}
                                                    <div className="space-y-3 min-w-0">
                                                        <div className="text-[10px] font-black text-[#4A5D45] uppercase tracking-widest border-b pb-1 flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5" /> Entrega
                                                        </div>
                                                        <div className="text-[11px] space-y-1.5 text-gray-700">
                                                            <p><span className="text-gray-400 font-medium">Tipo:</span> <span className="font-bold text-[#4A5D45] uppercase">{pedido.tipoEntrega || pedido.metodoEnvio}</span></p>
                                                            <p className="truncate"><span className="text-gray-400 font-medium">Dirección:</span> {pedido.direccion || 'No especificada'}</p>
                                                            {pedido.notasCliente && (
                                                                <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg flex gap-2">
                                                                    <MessageSquare className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-amber-800 italic leading-snug font-medium text-[10px]">"{pedido.notasCliente}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Items y Notas de Producto */}
                                                    <div className="space-y-3 min-w-0">
                                                        <div className="text-[10px] font-black text-[#4A5D45] uppercase tracking-widest border-b pb-1">Productos</div>
                                                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                                            {pedido.items.map((item: any) => (
                                                                <div key={item.id} className="flex flex-col border-b border-gray-50 pb-2">
                                                                    <div className="flex justify-between text-[10px] gap-2">
                                                                        <span className="text-gray-700 font-medium truncate max-w-[150px] sm:max-w-none">
                                                                            {item.nombreProducto} <span className="text-[#A3B18A] font-bold">x{item.cantidad}</span>
                                                                        </span>
                                                                        <span className="font-semibold text-gray-900">${item.subtotal.toLocaleString("es-AR")}</span>
                                                                    </div>
                                                                    {item.notas && (
                                                                        <div className="mt-1 flex items-start gap-1 bg-[#F5F5F0] p-1.5 rounded-md border border-[#E9E9E0]">
                                                                            <MessageSquare className="w-2.5 h-2.5 text-[#4A5D45] mt-0.5 flex-shrink-0" />
                                                                            <p className="text-[9px] text-[#5B6350] leading-tight italic">"{item.notas}"</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
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