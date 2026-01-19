'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Package, Settings, LogOut, Calendar, Eye, Phone, FlaskConical } from 'lucide-react'

interface Pedido {
  id: string
  numero: string
  fechaCreacion: string
  estado: string
  estadoPago: string
  total: number
  cantidadItems: number
  fechaEstimadaEnvio: string
  publicToken?: string | null
}

export default function MiCuentaPage() {
  const { user, isAuthenticated, isLoading, logout } = useUser()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosLoading, setPedidosLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/mi-cuenta/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPedidos()
    }
  }, [isAuthenticated, user])

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos/mis-pedidos', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPedidos(data.pedidos || [])
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
    } finally {
      setPedidosLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  function formatDate(value?: string | Date | null) {
    if (!value) return "-"
    const date = value instanceof Date ? value : new Date(value)
    if (isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getEstadoBadge = (estado: string) => {
    const e = (estado || "").toLowerCase()
    const baseClass = "font-bold uppercase text-[10px] tracking-wider px-3"

    if (e === "pending_payment_transfer") return <Badge variant="outline" className={`${baseClass} border-[#A3B18A] text-[#5B6350]`}>Pendiente de pago</Badge>
    if (e === "transfer_proof_sent") return <Badge className={`${baseClass} bg-[#A3B18A] text-white border-none`}>Comprobante enviado</Badge>
    if (e === "confirmado") return <Badge className={`${baseClass} bg-[#4A5D45] text-white border-none`}>Confirmado</Badge>
    if (e === "en_produccion") return <Badge className={`${baseClass} bg-[#4A5D45]/80 text-white border-none animate-pulse`}>En Preparación</Badge>
    if (e === "listo_envio") return <Badge className={`${baseClass} bg-[#A3B18A] text-white border-none`}>Listo para envío</Badge>
    if (e === "enviado") return <Badge className={`${baseClass} bg-[#3A4031] text-white border-none`}>En camino</Badge>
    if (e === "entregado") return <Badge className={`${baseClass} bg-[#3A4031] text-white border-none opacity-50`}>Entregado</Badge>
    if (e.includes("cancelado") || e.includes("expired")) return <Badge variant="destructive" className={baseClass}>Cancelado</Badge>

    return <Badge variant="secondary" className={baseClass}>Pendiente de confirmación</Badge>
  }

  if (isLoading) return <LoadingSkeleton />

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-12">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header Personalizado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-l-4 border-[#4A5D45] pl-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3A4031]">
              Tu cuenta
            </h1>
            <p className="text-[#5B6350] font-medium italic mt-1">
              Bienvenid@, {user.nombre}. Gestioná tus fórmulas y pedidos.
            </p>
          </div>

          {user.esAdmin && (
            <Link href="/admin">
              <Button className="bg-[#3A4031] hover:bg-[#4A5D45] text-[#F5F5F0] rounded-full shadow-lg">
                <Settings className="h-4 w-4 mr-2" />
                Panel Administrativo
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar: Perfil */}
          <div className="space-y-6">
            <Card className="border-none shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-[#F5F5F0]">
                <CardTitle className="flex items-center gap-2 text-[#4A5D45] text-lg">
                  <div className="p-2 bg-[#F5F5F0] rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  Perfil de Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {[
                  { label: "Nombre", value: `${user.nombre} ${user.apellido}` },
                  { label: "Email", value: user.email },
                  { label: "Teléfono", value: user.telefono || "No registrado" },
                  { label: "Paciente desde", value: formatDate(user?.creadoEn) }
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[10px] uppercase tracking-widest text-[#A3B18A] font-bold">{item.label}</p>
                    <p className="font-semibold text-[#3A4031]">{item.value}</p>
                  </div>
                ))}

                <Separator className="bg-[#F5F5F0]" />

                <div className="space-y-2">
                  <Button variant="ghost" className="w-full text-[#A3B18A] hover:bg-[#F5F5F0] text-xs" disabled>
                    Editar mis datos (Próximamente)
                  </Button>
                  <Button variant="ghost" className="w-full text-red-400 hover:bg-red-50 text-xs" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ayuda Magistral */}
            <div className="bg-[#4A5D45] p-6 rounded-2xl text-[#F5F5F0] shadow-xl relative overflow-hidden">
              <FlaskConical className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 rotate-12" />
              <h3 className="font-bold mb-2">Asesoramiento Directo</h3>
              <p className="text-xs opacity-80 mb-6">¿Tenés dudas sobre cómo aplicar tu fórmula o sobre el estado de un envío?</p>
              <a
                href="https://wa.me/541137024467"
                target="_blank"
                className="inline-flex items-center justify-center w-full bg-[#F5F5F0] text-[#4A5D45] py-3 rounded-xl font-bold text-sm hover:bg-[#E9E9E0] transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp Laboratorio
              </a>
            </div>
          </div>

          {/* Principal: Listado de Pedidos */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md rounded-2xl">
              <CardHeader className="bg-white border-b border-[#F5F5F0]">
                <CardTitle className="flex items-center gap-2 text-[#4A5D45] text-lg">
                  <Package className="h-5 w-5" />
                  Historial de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {pedidosLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#F5F5F0] animate-pulse rounded-xl" />)}
                  </div>
                ) : pedidos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F5F5F0] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-[#D6D6C2]" />
                    </div>
                    <h3 className="font-bold text-[#3A4031]">Aún no tenés pedidos registrados</h3>
                    <p className="text-sm text-[#5B6350] mt-2 mb-6">Explorá nuestras +200 fórmulas exclusivas.</p>
                    <Link href="/tienda">
                      <Button className="bg-[#4A5D45] hover:bg-[#3D4C39] text-white px-8 rounded-full">
                        Ir a la Tienda
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pedidos.slice(0, 5).map((pedido) => (
                      <div key={pedido.id} className="group p-5 border border-[#E9E9E0] rounded-2xl hover:border-[#A3B18A] hover:bg-white transition-all shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#3A4031]">#{pedido.numero}</span>
                              {getEstadoBadge(pedido.estado)}
                            </div>
                            <p className="text-xs text-[#5B6350]">
                              {formatDate(pedido.fechaCreacion)} • {pedido.cantidadItems} {pedido.cantidadItems === 1 ? 'producto' : 'productos'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-3 md:pt-0">
                            <div className="text-left md:text-right">
                              <p className="text-xs text-[#A3B18A] font-bold uppercase tracking-tighter">Total</p>
                              <p className="font-bold text-[#4A5D45]">{formatPrice(pedido.total)}</p>
                            </div>
                            <Link href={pedido.publicToken ? `/pedido/${pedido.publicToken}` : `/mi-cuenta`}>
                              <Button variant="outline" size="sm" className="border-[#D6D6C2] text-[#4A5D45] rounded-full px-5">
                                <Eye className="h-4 w-4 mr-2" />
                                Detalles
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guía de Estados */}
            <Card className="border-none bg-[#E9E9E0]/50 shadow-inner">
              <CardContent className="p-6">
                <h3 className="text-xs font-bold text-[#4A5D45] uppercase tracking-[0.2em] mb-4">Guía de Seguimiento</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-[11px] text-[#5B6350] leading-tight">
                  <p><strong className="text-[#3A4031]">Confirmado:</strong> El pago fue validado correctamente.</p>
                  <p><strong className="text-[#3A4031]">En Preparación:</strong> Elaborando tus productos.</p>
                  <p><strong className="text-[#3A4031]">Listo p/ Envío:</strong> Control de calidad final completado.</p>
                  <p><strong className="text-[#3A4031]">En Camino:</strong> El correo ya tiene tu paquete.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-8 animate-pulse">
        <div className="h-10 bg-[#E9E9E0] rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white rounded-2xl" />
          <div className="md:col-span-2 h-64 bg-white rounded-2xl" />
        </div>
      </div>
    </div>
  )
}