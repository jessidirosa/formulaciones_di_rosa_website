// src/app/api/admin/pedidos/[id]/confirmar/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generarRotuloYTracking } from "@/lib/shipping"
import { uploadLabelPdf } from "@/lib/storage/labels"

/**
 * @description Confirma el pago de un pedido y dispara la logística de envío.
 * Flujo: Confirmación -> Generación de Tracking -> Creación de Rótulo PDF -> Almacenamiento.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
    try {
        const pedidoId = Number(params.id)

        // Validación de entrada técnica
        if (!pedidoId || isNaN(pedidoId)) {
            return NextResponse.json(
                { ok: false, error: "Identificador de pedido no válido" },
                { status: 400 }
            )
        }

        // Buscamos el pedido con sus datos de envío
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId }
        })

        if (!pedido) {
            return NextResponse.json(
                { ok: false, error: "La orden solicitada no existe en el registro" },
                { status: 404 }
            )
        }

        // 1. Actualización de estado a 'confirmado'
        // Se utiliza una transacción o actualización atómica para asegurar la integridad
        const pedidoConfirmado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: {
                estado: "confirmado",
                // Aquí podrías agregar fecha de confirmación si tuvieras el campo
            },
        })

        // 2. Evaluación de Logística Magistral
        const tipoEntrega = (pedidoConfirmado.tipoEntrega || "").toUpperCase()
        const requiereGestionLogistica =
            tipoEntrega === "ENVIO_DOMICILIO" ||
            tipoEntrega === "SUCURSAL_CORREO"

        // 3. Generación automática de documentos de envío
        if (requiereGestionLogistica) {
            // Evitamos duplicidad de tracking y etiquetas si ya fueron generados
            if (!pedidoConfirmado.trackingNumber || !pedidoConfirmado.labelUrl) {

                console.log(`📦 Iniciando gestión de envío para Pedido #${pedidoId}...`)

                // Disparamos la integración con el carrier (Andreani / Correo Argentino)
                const { trackingNumber, pdf, trackingUrl } = await generarRotuloYTracking(pedidoConfirmado)

                // Subida del Rótulo al storage (Vercel Blob / S3 / Supabase)
                const labelUrl = await uploadLabelPdf(pedidoId, pdf)

                // Actualizamos la orden con los datos de seguimiento técnico
                await prisma.pedido.update({
                    where: { id: pedidoId },
                    data: {
                        trackingNumber,
                        trackingUrl,
                        labelUrl,
                    },
                })

                console.log(`✅ Logística vinculada: ${trackingNumber}`)
            }
        }

        // Respuesta exitosa
        return NextResponse.json({
            ok: true,
            mensaje: "Pedido confirmado y logística procesada correctamente",
            data: {
                id: pedidoId,
                estado: "confirmado"
            }
        })

    } catch (e: any) {
        // Registro detallado del error en el servidor
        console.error("❌ ERROR CRÍTICO EN CONFIRMACIÓN DE PEDIDO:", {
            pedidoId: params.id,
            error: e?.message,
            stack: e?.stack
        })

        return NextResponse.json(
            {
                ok: false,
                error: "Error interno en la validación de la orden magistral",
                details: e?.message
            },
            { status: 500 }
        )
    }
}