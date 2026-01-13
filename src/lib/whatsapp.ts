export async function sendWhatsAppMessage(to: string, message: string) {
    const token = process.env.WHATSAPP_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!token || !phoneNumberId) {
        console.warn('WhatsApp env vars faltan. No se envió mensaje.', {
            hasToken: !!token,
            hasPhoneNumberId: !!phoneNumberId,
        })
        return
    }

    if (!to) {
        console.warn('ADMIN_WHATSAPP_TO vacío. No se envió mensaje.')
        return
    }

    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`

    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    const text = await res.text()

    if (!res.ok) {
        console.error('Error WhatsApp:', {
            status: res.status,
            statusText: res.statusText,
            body: text,
        })
        throw new Error('No se pudo enviar WhatsApp')
    }

    console.log('WhatsApp enviado OK:', text)
}
