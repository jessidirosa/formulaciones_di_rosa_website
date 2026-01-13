export const dynamic = 'force-dynamic'
export const revalidate = 0

import GenerarRotuloButton from "@/components/admin/GenerarRotuloButton"

import { Fragment } from "react"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    const nuevos = await prisma.pedido.count({ where: { adminSeenAt: null } })

    const params = await searchParams

    const search = params.search ?? ""
    const estado = params.estado ?? "todos"
    const desde = params.desde ?? ""
    const hasta = params.hasta ?? ""

    const where: any = {}

    if (search) {
        where.numero = { contains: search.toUpperCase() }
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

    const now = new Date()

    await prisma.pedido.updateMany({
        where: {
            metodoPago: "TRANSFERENCIA",
            estado: "pending_payment_transfer",
            expiresAt: { lt: now },
        },
        data: { estado: "cancelled_expired" },
    })


    const pedidos = await prisma.pedido.findMany({
        where,
        orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
        ],
        include: { items: true, user: true },
    })



    await prisma.pedido.updateMany({
        where: { adminSeenAt: null },
        data: { adminSeenAt: new Date() },
    })


    const totalPedidos = pedidos.length
    const totalFacturado = pedidos.reduce(
        (acc: number, p) => acc + p.total,
        0
    )

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold">Panel de pedidos</h1>

                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/api/admin/pedidos/export">
                            Export pedidos (CSV)
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="border-blue-200">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-blue-600">
                        Resumen
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-gray-700">
                        Pedidos: <strong>{totalPedidos}</strong>
                    </p>
                    <p className="text-gray-700">
                        Facturado:{" "}
                        <strong>${totalFacturado.toLocaleString("es-AR")}</strong>
                    </p>
                </CardContent>
            </Card>

            <Card className="border-gray-300">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filtros */}
                    <form className="grid grid-cols-1 sm:grid-cols-4 gap-4" method="GET">
                        <div>
                            <label className="text-sm block mb-1">N° de pedido</label>
                            <Input
                                name="search"
                                placeholder="Ej: DR-000123"
                                defaultValue={search}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">Estado</label>
                            <select
                                name="estado"
                                defaultValue={estado}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                            >
                                <option value="todos">Todos</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="pagado">Pagado</option>
                                <option value="cancelado">Cancelado</option>
                                <option value="enviado">Enviado</option>
                                <option value="entregado">Entregado</option>
                                <option value="listo_envio">Listo</option>
                                <option value="en_produccion">En producción</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm block mb-1">Desde</label>
                            <Input type="date" name="desde" defaultValue={desde} />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">Hasta</label>
                            <Input type="date" name="hasta" defaultValue={hasta} />
                        </div>

                        <div className="sm:col-span-4 flex gap-2 justify-end mt-2">
                            <Button type="submit" size="sm">
                                Aplicar filtros
                            </Button>

                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/pedidos">Limpiar</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-700">
                        Pedidos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pedidos.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No hay pedidos con los filtros seleccionados.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>N° Pedido</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Método envío</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>Envío</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pedidos.map((pedido) => (
                                    <Fragment key={pedido.id}>
                                        <TableRow>
                                            <TableCell>{pedido.numero}</TableCell>
                                            <TableCell>
                                                {new Date(pedido.createdAt).toLocaleString("es-AR")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    <EstadoPedidoSelect
                                                        key={`${pedido.id}-${pedido.estado}`}  // 👈 remount si cambia estado
                                                        pedidoId={pedido.id}
                                                        estadoActual={pedido.estado}
                                                    />

                                                    <div className="flex gap-2 flex-wrap">
                                                        <ConfirmarPedidoButton pedidoId={pedido.id} />
                                                        <GenerarRotuloButton pedidoId={pedido.id} />
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="capitalize">
                                                {pedido.metodoEnvio}
                                            </TableCell>
                                            <TableCell>${pedido.subtotal}</TableCell>
                                            <TableCell>${pedido.costoEnvio}</TableCell>
                                            <TableCell className="font-semibold">
                                                ${pedido.total}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={pedido.publicToken ? `/pedido/${pedido.publicToken}` : `/checkout/confirmacion/${pedido.id}`}>
                                                        Ver
                                                    </Link>

                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell colSpan={8}>
                                                <div className="bg-gray-50 rounded-md p-3 space-y-4">
                                                    {/* Datos de la cuenta */}
                                                    <div>
                                                        <p className="text-xs font-semibold mb-1">
                                                            Datos de la cuenta:
                                                        </p>
                                                        {pedido.user ? (
                                                            <div className="text-xs text-gray-700 flex flex-col sm:flex-row sm:gap-4">
                                                                <span>
                                                                    Nombre: {pedido.user.name || "Sin nombre"}
                                                                </span>
                                                                <span>Email: {pedido.user.email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">
                                                                Pedido realizado como invitado (sin usuario
                                                                registrado).
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Datos del cliente + envío */}
                                                    <div>
                                                        <p className="text-xs font-semibold mb-1">
                                                            Datos del cliente y envío:
                                                        </p>
                                                        <div className="grid gap-1 text-[11px] sm:grid-cols-2">
                                                            <span>
                                                                Nombre cliente:{" "}
                                                                {pedido.nombreCliente ?? "-"}
                                                            </span>
                                                            <span>
                                                                Apellido cliente:{" "}
                                                                {pedido.apellidoCliente ?? "-"}
                                                            </span>
                                                            <span>
                                                                Email de contacto:{" "}
                                                                {pedido.emailCliente ?? "-"}
                                                            </span>
                                                            <span>
                                                                Teléfono: {pedido.telefonoCliente ?? "-"}
                                                            </span>
                                                            <span>DNI: {pedido.dniCliente ?? "-"}</span>
                                                            <span>
                                                                Dirección: {pedido.direccion ?? "-"}
                                                            </span>
                                                            <span>Ciudad: {pedido.ciudad ?? "-"}</span>
                                                            <span>
                                                                Provincia: {pedido.provincia ?? "-"}
                                                            </span>
                                                            <span>
                                                                Código postal: {pedido.codigoPostal ?? "-"}
                                                            </span>
                                                            <span>
                                                                Sucursal correo: {pedido.sucursalCorreo ?? "-"}
                                                            </span>
                                                            <span>
                                                                Fecha estimada de envío:{" "}
                                                                {pedido.fechaEstimadaEnvio
                                                                    ? new Date(
                                                                        pedido.fechaEstimadaEnvio
                                                                    ).toLocaleDateString("es-AR")
                                                                    : "-"}
                                                            </span>
                                                            <span className="sm:col-span-2">
                                                                Notas del cliente:{" "}
                                                                {pedido.notasCliente ?? "-"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Productos del pedido */}
                                                    <div>
                                                        <p className="text-xs font-semibold mb-2">
                                                            Productos del pedido:
                                                        </p>
                                                        {pedido.items.length === 0 ? (
                                                            <span className="text-xs text-gray-500">
                                                                Sin items registrados.
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-col gap-1 text-xs">
                                                                {pedido.items.map((item) => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="flex justify-between"
                                                                    >
                                                                        <span>
                                                                            {item.nombreProducto} x {item.cantidad}
                                                                        </span>
                                                                        <span>${item.subtotal}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
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
