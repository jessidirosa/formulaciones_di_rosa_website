import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!session || user?.role !== "ADMIN") return null
    return { session, user }
}

function csvEscape(v: any) {
    const s = String(v ?? "")
    const escaped = s.replace(/"/g, '""')
    return /[",\n;]/.test(escaped) ? `"${escaped}"` : escaped
}

export async function GET(req: NextRequest) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const year = Number(sp.get("year")) || new Date().getFullYear()
    const month = Number(sp.get("month")) || new Date().getMonth() + 1
    const estadoMode = sp.get("estadoMode") || "all"
    const estadoOnly = sp.get("estado") || ""

    const desde = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
    const hasta = new Date(Date.UTC(year, month, 1, 0, 0, 0))

    const where: any = { createdAt: { gte: desde, lt: hasta } }
    if (estadoMode === "exclude_cancelled") where.NOT = { estado: "cancelado" }
    else if (estadoMode === "only" && estadoOnly) where.estado = estadoOnly

    const pedidos = await prisma.pedido.findMany({
        where,
        orderBy: { createdAt: "asc" }
    })

    const filename = `reporte_detallado_di_rosa_${year}_${month}.csv`
    const sep = ";"

    // 1. HEADERS COMPLETOS (Sin eliminar nada)
    const headers = [
        "Fecha", "Pedido #", "Estado", "Cliente", "Email", "Telefono", "DNI",
        "Tipo Entrega", "Carrier", "Direccion", "Localidad", "Provincia", "CP", "Sucursal",
        "Metodo Pago", "Tarjeta/Medio", "Cuotas", "Subtotal", "Envio",
        "Cupon Usado", "Descuentos Aplicados",
        "Total Cobrado", "Comision MP", "Neto Real", "Notas"
    ].join(sep)

    // Acumuladores para el resumen final (solo pedidos NO cancelados)
    let totalEnviosAcum = 0
    let totalVentasRealAcum = 0
    let totalNetoAcum = 0

    const csvRows = pedidos.map((p: any) => {
        const subtotal = Number(p.subtotal || 0)
        const envio = Number(p.costoEnvio || 0)
        const total = Number(p.total || 0)
        const descCupon = Number(p.cuponDescuento || 0)

        // Lógica de descuentos separada
        const baseConCupon = subtotal + envio - descCupon
        const descTransfer = p.metodoPago === "TRANSFERENCIA" ? Math.max(0, baseConCupon - total) : 0

        // Lógica de Neto y Comisiones
        let comision = p.mpFee ? Number(p.mpFee) : 0
        let neto = p.netoReal ? Number(p.netoReal) : total

        // Si es un pedido viejo de MP sin datos nuevos, estimamos para no dejar en 0
        if (!p.mpFee && p.metodoPago === "MERCADOPAGO") {
            comision = total * 0.08
            neto = total - comision
        }

        if (p.estado !== "cancelado") {
            totalEnviosAcum += envio
            totalVentasRealAcum += total
            totalNetoAcum += neto
        }

        return [
            csvEscape(p.createdAt.toISOString().split('T')[0]),
            csvEscape(p.numero),
            csvEscape(p.estado),
            csvEscape(`${p.nombreCliente} ${p.apellidoCliente}`),
            csvEscape(p.emailCliente),
            csvEscape(p.telefonoCliente),
            csvEscape(p.dniCliente),
            csvEscape(p.tipoEntrega),
            csvEscape(p.carrier || ""),
            csvEscape(p.direccion || ""),
            csvEscape(p.localidad || ""),
            csvEscape(p.provincia || ""),
            csvEscape(p.codigoPostal || ""),
            csvEscape(p.sucursalCorreo || ""),
            csvEscape(p.metodoPago),
            csvEscape(p.mpPaymentMethod || "N/A"),
            csvEscape(p.mpInstallments || "1"),
            csvEscape(subtotal),
            csvEscape(envio),
            csvEscape(p.cuponCodigo || "N/A"),
            csvEscape(descTransfer.toFixed(0)),
            csvEscape(total),
            csvEscape(comision.toFixed(2)),
            csvEscape(neto.toFixed(2)),
            csvEscape(p.notasCliente || "")
        ].join(sep)
    })

    // 2. FILA DE RESUMEN FINAL (Acumulados del mes)
    const filaVacia = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""].join(sep)
    const filaTotales = [
        "TOTALES MES (SIN CANCELADOS)", "", "", "", "", "", "", "", "", "", "", "", "", "",
        "Suma Envios:", csvEscape(totalEnviosAcum.toFixed(2)),
        "", "Ventas Brutas:", csvEscape(totalVentasRealAcum.toFixed(2)),
        "Neto Total:", csvEscape(totalNetoAcum.toFixed(2)), ""
    ].join(sep)

    const csv = "\ufeff" + ["sep=;", headers, ...csvRows, filaVacia, filaTotales].join("\n")

    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    })
}