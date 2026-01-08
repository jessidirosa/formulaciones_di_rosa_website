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

// CSV helpers
function csvEscape(v: any) {
    const s = String(v ?? "")
    const escaped = s.replace(/"/g, '""')
    return /[",\n;]/.test(escaped) ? `"${escaped}"` : escaped
}

function parseEstadoFilter(raw: string | null) {
    // modos soportados
    // - all: no filtra
    // - exclude_cancelled: excluye cancelado
    // - only: solo un estado específico (estado=pagado)
    const mode = (raw || "exclude_cancelled").toLowerCase()
    return mode
}

/**
 * GET /api/admin/reportes/ventas-productos
 * Query:
 * - year=2025
 * - month=12
 * - format=csv (default csv)
 * - estadoMode=exclude_cancelled | all | only
 * - estado=pagado (solo si estadoMode=only)
 */
export async function GET(req: NextRequest) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const sp = req.nextUrl.searchParams

    const now = new Date()
    const year = Number(sp.get("year")) || now.getFullYear()
    const month = Number(sp.get("month")) || now.getMonth() + 1 // 1-12
    const format = (sp.get("format") || "csv").toLowerCase()

    const estadoMode = parseEstadoFilter(sp.get("estadoMode"))
    const estadoOnly = sp.get("estado") || "" // usado si estadoMode=only

    // rango mensual [desde, hasta)
    const desde = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
    const hasta = new Date(Date.UTC(year, month, 1, 0, 0, 0))

    const pedidoWhere: any = {
        createdAt: { gte: desde, lt: hasta },
    }

    if (estadoMode === "exclude_cancelled") {
        pedidoWhere.NOT = { estado: "cancelado" }
    }

    if (estadoMode === "only") {
        if (!estadoOnly) {
            return NextResponse.json(
                { error: "Falta el parámetro estado cuando estadoMode=only" },
                { status: 400 }
            )
        }
        pedidoWhere.estado = estadoOnly
    }

    // Traemos items del mes + el estado del pedido
    const items = await prisma.pedidoItem.findMany({
        where: {
            pedido: pedidoWhere,
        },
        select: {
            productoId: true,
            nombreProducto: true,
            cantidad: true,
            subtotal: true,
            pedido: {
                select: {
                    id: true,
                    estado: true,
                    createdAt: true,
                },
            },
            producto: {
                select: {
                    nombre: true,
                    slug: true,
                    precio: true,
                },
            },
        },
    })

    // Resumen por producto (1 fila por producto)
    type Row = {
        productoId: number | null
        producto: string
        slug: string
        cantidadTotal: number
        ventasTotales: number
        pedidosUnicos: number
    }

    const map = new Map<string, Row>()

    for (const it of items) {
        const productoId = it.productoId ?? null
        const productoNombre = it.producto?.nombre ?? it.nombreProducto
        const slug = it.producto?.slug ?? ""
        const key = `${productoId ?? "null"}::${productoNombre}`

        const prev =
            map.get(key) ||
            ({
                productoId,
                producto: productoNombre,
                slug,
                cantidadTotal: 0,
                ventasTotales: 0,
                pedidosUnicos: 0,
            } as Row)

        prev.cantidadTotal += it.cantidad
        prev.ventasTotales += it.subtotal

        // contamos pedidos únicos por producto
        // (sin set global por performance: lo hacemos con un Set por producto en una pasada extra)
        map.set(key, prev)
    }

    // pedidos únicos: pasamos 2da vuelta usando sets
    const sets = new Map<string, Set<number>>()
    for (const it of items) {
        const productoId = it.productoId ?? null
        const productoNombre = it.producto?.nombre ?? it.nombreProducto
        const key = `${productoId ?? "null"}::${productoNombre}`
        if (!sets.has(key)) sets.set(key, new Set<number>())
        sets.get(key)!.add(it.pedido.id)
    }
    for (const [key, set] of sets.entries()) {
        const row = map.get(key)
        if (row) row.pedidosUnicos = set.size
    }

    const filas = Array.from(map.values()).sort((a, b) => b.cantidadTotal - a.cantidadTotal)

    // JSON (debug)
    if (format === "json") {
        return NextResponse.json({
            year,
            month,
            desde: desde.toISOString(),
            hasta: hasta.toISOString(),
            estadoMode,
            estado: estadoMode === "only" ? estadoOnly : null,
            totalItems: items.length,
            filas,
        })
    }

    // CSV (default)
    const filename = `ventas_productos_${year}-${String(month).padStart(2, "0")}_${estadoMode}${estadoMode === "only" ? `_${estadoOnly}` : ""}.csv`
    const sep = ";"


    const header = [
        "year",
        "month",
        "estadoMode",
        "estado",
        "productoId",
        "producto",
        "slug",
        "cantidadTotal",
        "ventasTotalesARS",
        "pedidosUnicos",
    ].join(sep)

    const csvRows = filas.map((f) =>
        [
            csvEscape(year),
            csvEscape(month),
            csvEscape(estadoMode),
            csvEscape(estadoMode === "only" ? estadoOnly : ""),
            csvEscape(f.productoId),
            csvEscape(f.producto),
            csvEscape(f.slug),
            csvEscape(f.cantidadTotal),
            csvEscape(f.ventasTotales),
            csvEscape(f.pedidosUnicos),
        ].join(sep)
    )

    const csv = "\ufeff" + ["sep=;", header, ...csvRows].join("\n")

    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },

    })
}
