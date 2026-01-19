// src/lib/storage/labels.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const bucket = process.env.SUPABASE_LABELS_BUCKET || 'labels'

export async function uploadLabelPdf(pedidoId: number, pdf: Buffer) {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
    })

    const path = `pedido-${pedidoId}/${Date.now()}.pdf`

    const { error } = await supabase.storage.from(bucket).upload(path, pdf, {
        contentType: 'application/pdf',
        upsert: true,
    })
    if (error) throw new Error(`Supabase upload error: ${error.message}`)

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}
