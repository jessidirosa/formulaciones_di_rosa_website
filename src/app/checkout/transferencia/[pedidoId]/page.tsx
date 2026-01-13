import TransferenciaClient from './TransferenciaClient'

export const dynamic = 'force-dynamic'

export default async function TransferenciaPage({
    params,
}: {
    params: Promise<{ pedidoId: string }>
}) {
    const { pedidoId } = await params
    return <TransferenciaClient pedidoId={pedidoId} />
}
