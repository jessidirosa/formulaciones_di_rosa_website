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

// ✅ Función de escape mejorada para Excel
function csvEscape(v: any) {
    let s = String(v ?? "").trim()

    // Si es un número largo (Teléfono, DNI, CP), le agregamos una tabulación al inicio.
    // Esto obliga a Excel a tratarlo como texto sin mostrar caracteres extraños.
    if (/^\d{7,}$/.test(s)) {
        return `"\t${s}"`
    }

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
    const sep = ";" // Punto y coma es el estándar para Excel en español

    // 1. HEADERS COMPLETOS
    const headers = [
        "Fecha", "Pedido #", "Estado", "Cliente", "Email", "Telefono", "DNI",
        "Tipo Entrega", "Carrier", "Direccion", "Localidad", "Provincia", "CP", "Sucursal",
        "Metodo Pago", "Tarjeta/Medio", "Cuotas", "Subtotal", "Envio",
        "Cupon Usado", "Descuentos Aplicados",
        "Total Cobrado", "Comision MP", "Neto Real", "Costo 40%", "Ganancia Neta Final", "Notas"
    ].join(sep)

    let totalEnviosAcum = 0
    let totalVentasRealAcum = 0
    let totalNetoAcum = 0
    let totalGananciaFinalAcum = 0

    const csvRows = pedidos.map((p: any) => {
        const subtotal = Number(p.subtotal || 0)
        const envio = Number(p.costoEnvio || 0)
        const total = Number(p.total || 0)
        const descCupon = Number(p.cuponDescuento || 0)

        const baseConCupon = subtotal + envio - descCupon
        const descTransfer = p.metodoPago === "TRANSFERENCIA" ? Math.max(0, baseConCupon - total) : 0

        let comision = p.mpFee ? Number(p.mpFee) : 0
        let neto = p.netoReal ? Number(p.netoReal) : total

        if (!p.mpFee && p.metodoPago === "MERCADOPAGO") {
            comision = total * 0.08
            neto = total - comision
        }

        const costo40 = subtotal * 0.40
        const gananciaFinal = neto - costo40

        if (p.estado !== "cancelado") {
            totalEnviosAcum += envio
            totalVentasRealAcum += total
            totalNetoAcum += neto
            totalGananciaFinalAcum += gananciaFinal
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
            csvEscape(costo40.toFixed(2)),
            csvEscape(gananciaFinal.toFixed(2)),
            csvEscape(p.notasCliente || "")
        ].join(sep)
    })

    const filaVacia = Array(27).fill("").join(sep)
    const filaTotales = [
        "TOTALES MES (SIN CANCELADOS)", "", "", "", "", "", "", "", "", "", "", "", "", "",
        "Suma Envios:", csvEscape(totalEnviosAcum.toFixed(2)),
        "", "Ventas Brutas:", csvEscape(totalVentasRealAcum.toFixed(2)),
        "Neto Total:", csvEscape(totalNetoAcum.toFixed(2)),
        "Ganancia Final:", csvEscape(totalGananciaFinalAcum.toFixed(2)), ""
    ].join(sep)

    // ✅ La clave es el BOM (\ufeff) pegado al contenido
    const csvContent = "\ufeff" + [headers, ...csvRows, filaVacia, filaTotales].join("\n")

    return new NextResponse(csvContent, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    })
}