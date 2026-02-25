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

// ✅ Función de escape mejorada con tabulación invisible para IDs y números largos
function csvEscape(v: any) {
    let s = String(v ?? "").trim()

    // Si es un número largo (productoId, cantidades grandes, etc), aplicamos tabulación invisible
    if (/^\d{7,}$/.test(s)) {
        return `"\t${s}"`
    }

    const escaped = s.replace(/"/g, '""')
    return /[",\n;]/.test(escaped) ? `"${escaped}"` : escaped
}

function parseEstadoFilter(raw: string | null) {
    const mode = (raw || "exclude_cancelled").toLowerCase()
    return mode
}

export async function GET(req: NextRequest) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const sp = req.nextUrl.searchParams

    const now = new Date()
    const year = Number(sp.get("year")) || now.getFullYear()
    const month = Number(sp.get("month")) || now.getMonth() + 1
    const format = (sp.get("format") || "csv").toLowerCase()

    const estadoMode = parseEstadoFilter(sp.get("estadoMode"))
    const estadoOnly = sp.get("estado") || ""

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
        map.set(key, prev)
    }

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

    // ✅ BOM (\ufeff) pegado al contenido y sin sep=; al inicio para máxima compatibilidad
    const csvContent = "\ufeff" + [header, ...csvRows].join("\n")

    return new NextResponse(csvContent, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    })
}