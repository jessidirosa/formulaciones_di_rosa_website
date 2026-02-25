'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from "sonner"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { useCart } from "@/contexts/CartContext"
import { RefreshCw } from "lucide-react"
import {
  User,
  Package,
  Settings,
  LogOut,
  Calendar,
  Eye,
  Phone,
  FlaskConical,
  Pencil,
  Loader2,
  X,
  Lock,
  Mail
} from 'lucide-react'

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
  items?: any[]
}

export default function MiCuentaPage() {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useUser()
  const { addItem } = useCart()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosLoading, setPedidosLoading] = useState(true)
  const [isRedoing, setIsRedoing] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    currentPassword: '',
    newPassword: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/mi-cuenta/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPedidos()
      setEditForm({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        currentPassword: '',
        newPassword: ''
      })
    }
  }, [isAuthenticated, user])

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos/mis-pedidos', { credentials: 'include' })
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

  const handleRehacerPedido = async (pedido: Pedido) => {
    setIsRedoing(pedido.id);
    try {
      let itemsACargar = pedido.items;

      if (!itemsACargar) {
        const res = await fetch(`/api/pedidos/${pedido.id}`);
        const data = await res.json();
        itemsACargar = data.items || data.pedido?.items;
      }

      if (!itemsACargar || itemsACargar.length === 0) {
        toast.error("No se encontraron los productos.");
        return;
      }

      itemsACargar.forEach((item: any) => {
        // ✅ Lógica para respetar ediciones del ADMIN:
        const productoValidado = {
          // Si no tiene ID (producto manual), usamos el nombre como clave única temporal
          id: item.presentacionId || item.productoId || `manual-${item.nombreProducto}`,
          nombre: item.nombreProducto,
          slug: item.producto?.slug || "personalizado",
          // 💰 Respetamos el precio que el Admin puso manualmente:
          precio: item.precioUnitario || (item.subtotal / item.cantidad),
          imagen: item.producto?.imagen || "/images/placeholder-magistral.jpg",
          categoria: item.producto?.categoria || "Personalizado"
        };

        addItem(productoValidado as any, item.cantidad);
      });

      toast.success("¡Pedido cargado exactamente como la última vez!");

      setTimeout(() => {
        router.push('/carrito');
      }, 400);

    } catch (e) {
      console.error("Error:", e);
      toast.error("Error al procesar el pedido.");
    } finally {
      setIsRedoing(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Perfil actualizado correctamente")
        if (editForm.email !== user?.email) {
          toast.info("Email actualizado. Iniciá sesión nuevamente.")
          setTimeout(() => handleLogout(), 2000)
          return
        }
        if (refreshUser) await refreshUser()
        setIsEditModalOpen(false)
        setEditForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }))
      } else {
        toast.error(data.error || "Error al actualizar")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price)
  }

  function formatDate(value?: string | Date | null) {
    if (!value) return "-"
    const date = value instanceof Date ? value : new Date(value)
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const getEstadoBadge = (estado: string) => {
    const e = (estado || "").toLowerCase()
    const baseClass = "font-bold uppercase text-[10px] tracking-wider px-3"
    if (e === "pending_payment_transfer") return <Badge variant="outline" className={`${baseClass} border-amber-200 text-amber-600`}>Esperando Transferencia</Badge>
    if (e === "pendiente_mercadopago") return <Badge variant="outline" className={`${baseClass} border-blue-200 text-blue-600 bg-blue-50`}>Pago en Proceso</Badge>
    if (e === "transfer_proof_sent") return <Badge className={`${baseClass} bg-blue-100 text-blue-700 border-none`}>Comprobante enviado</Badge>
    if (e === "confirmado") return <Badge className={`${baseClass} bg-[#4A5D45] text-white border-none`}>Confirmado</Badge>
    if (e === "en_produccion") return <Badge className={`${baseClass} bg-[#4A5D45]/80 text-white border-none animate-pulse`}>En Preparación</Badge>
    if (e === "listo_envio") return <Badge className={`${baseClass} bg-[#A3B18A] text-white border-none`}>Listo para envío</Badge>
    if (e === "enviado") return <Badge className={`${baseClass} bg-[#3A4031] text-white border-none`}>En camino</Badge>
    if (e === "entregado") return <Badge className={`${baseClass} bg-[#3A4031] text-white border-none opacity-50`}>Entregado</Badge>
    if (e.includes("cancelado") || e.includes("expired")) return <Badge variant="destructive" className={baseClass}>Cancelado</Badge>
    return <Badge variant="secondary" className={baseClass}>Pendiente</Badge>
  }

  if (isLoading) return <LoadingSkeleton />
  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-l-4 border-[#4A5D45] pl-6 gap-4 text-left">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3A4031]">Tu cuenta</h1>
            <p className="text-[#5B6350] font-medium italic mt-1">Bienvenid@, {user.nombre}. Gestioná tus fórmulas y pedidos.</p>
          </div>
          {user.role === "ADMIN" && (
            <Link href="/admin"><Button className="bg-[#3A4031] hover:bg-[#4A5D45] text-[#F5F5F0] rounded-full shadow-lg"><Settings className="h-4 w-4 mr-2" />Panel Administrativo</Button></Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          <div className="space-y-6">
            <Card className="border-none shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-[#F5F5F0]">
                <CardTitle className="flex items-center gap-2 text-[#4A5D45] text-lg"><div className="p-2 bg-[#F5F5F0] rounded-lg"><User className="h-5 w-5" /></div>Perfil de Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div><p className="text-[10px] uppercase tracking-widest text-[#A3B18A] font-bold">Nombre</p><p className="font-semibold text-[#3A4031]">{user.nombre} {user.apellido}</p></div>
                <div><p className="text-[10px] uppercase tracking-widest text-[#A3B18A] font-bold">Email</p><p className="font-semibold text-[#3A4031]">{user.email}</p></div>
                <div><p className="text-[10px] uppercase tracking-widest text-[#A3B18A] font-bold">Teléfono</p><p className="font-semibold text-[#3A4031]">{user.telefono || "No registrado"}</p></div>
                <Separator className="bg-[#F5F5F0]" />
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full text-[#4A5D45] text-xs font-bold uppercase" onClick={() => setIsEditModalOpen(true)}><Pencil className="h-3 w-3 mr-2" />Editar mis datos</Button>
                  <Button variant="ghost" className="w-full text-red-400 text-xs" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Cerrar Sesión</Button>
                </div>
              </CardContent>
            </Card>
            <div className="bg-[#4A5D45] p-6 rounded-2xl text-[#F5F5F0] shadow-xl relative overflow-hidden">
              <FlaskConical className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 rotate-12" />
              <h3 className="font-bold mb-2 text-sm uppercase tracking-widest">Asesoramiento Directo</h3>
              <p className="text-[11px] opacity-80 mb-6">¿Tenés dudas sobre cómo aplicar tu fórmula o sobre el estado de un envío?</p>
              <a href="https://wa.me/541137024467" target="_blank" className="inline-flex items-center justify-center w-full bg-[#F5F5F0] text-[#4A5D45] py-3 rounded-xl font-bold text-xs uppercase tracking-widest">
                <Phone className="h-4 w-4 mr-2" />WhatsApp Laboratorio
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md rounded-2xl">
              <CardHeader className="bg-white border-b border-[#F5F5F0]">
                <CardTitle className="flex items-center gap-2 text-[#4A5D45] text-lg"><Package className="h-5 w-5" />Historial de Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {pedidosLoading ? (
                  <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#F5F5F0] animate-pulse rounded-xl" />)}</div>
                ) : pedidos.length === 0 ? (
                  <div className="text-center py-12"><h3 className="font-bold text-[#3A4031]">No tenés pedidos aún</h3><Link href="/tienda"><Button className="mt-4 bg-[#4A5D45] text-white">Ir a la Tienda</Button></Link></div>
                ) : (
                  <div className="space-y-4">
                    {pedidos.map((pedido) => (
                      <div key={pedido.id} className="p-5 border border-[#E9E9E0] rounded-2xl hover:border-[#A3B18A] transition-all">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="space-y-1 text-left"><div className="flex items-center gap-2"><span className="font-bold text-[#3A4031]">#{pedido.numero}</span>{getEstadoBadge(pedido.estado)}</div><p className="text-xs text-[#5B6350]">{formatDate(pedido.fechaCreacion)}</p></div>
                          <div className="flex items-center gap-3">
                            <div className="text-right mr-4"><p className="text-[10px] text-[#A3B18A] font-bold uppercase">Total</p><p className="font-bold text-[#4A5D45]">{formatPrice(pedido.total)}</p></div>
                            <Button variant="outline" size="sm" onClick={() => handleRehacerPedido(pedido)} disabled={isRedoing === pedido.id} className="border-[#A3B18A] text-[#4A5D45] rounded-full text-[10px] font-bold uppercase">
                              {isRedoing === pedido.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />} Rehacer
                            </Button>
                            <Link href={pedido.publicToken ? `/pedido/${pedido.publicToken}` : `/mi-cuenta`}><Button variant="outline" size="sm" className="border-[#D6D6C2] text-[#4A5D45] rounded-full text-[10px] font-bold uppercase"><Eye className="h-3 w-3 mr-2" />Detalles</Button></Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MODAL DE EDICIÓN RESTAURADO COMPLETO */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-[#3A4031]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md rounded-3xl shadow-2xl border-none bg-white overflow-hidden text-left">
              <div className="p-6 border-b border-[#F5F5F0] flex justify-between items-center">
                <h3 className="font-bold text-[#3A4031] uppercase tracking-widest text-sm">Editar mis datos</h3>
                <button onClick={() => setIsEditModalOpen(false)}><X className="h-5 w-5 text-[#A3B18A]" /></button>
              </div>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="p-8 space-y-4 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-[#A3B18A]">Nombre</label><Input value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} className="rounded-xl bg-[#F9F9F7]" required /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-[#A3B18A]">Apellido</label><Input value={editForm.apellido} onChange={e => setEditForm({ ...editForm, apellido: e.target.value })} className="rounded-xl bg-[#F9F9F7]" required /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-[#A3B18A] flex items-center gap-1"><Mail className="w-3 h-3" /> Email de acceso</label><Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="rounded-xl bg-[#F9F9F7]" required /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-[#A3B18A]">Teléfono</label><Input value={editForm.telefono} onChange={e => setEditForm({ ...editForm, telefono: e.target.value })} className="rounded-xl bg-[#F9F9F7]" /></div>

                  <Separator className="my-2 opacity-50" />

                  <div className="p-4 bg-[#F9F9F7] rounded-2xl space-y-4 border border-[#E9E9E0]">
                    <p className="text-[10px] font-bold uppercase text-[#4A5D45] flex items-center gap-2"><Lock className="w-3 h-3" /> Cambio de Contraseña (Opcional)</p>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-[#A3B18A]">Contraseña Actual</label><Input type="password" value={editForm.currentPassword} onChange={e => setEditForm({ ...editForm, currentPassword: e.target.value })} className="rounded-xl bg-white" placeholder="••••••••" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-[#A3B18A]">Nueva Contraseña</label><Input type="password" value={editForm.newPassword} onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })} className="rounded-xl bg-white" placeholder="Mínimo 6 caracteres" /></div>
                  </div>
                </CardContent>
                <div className="p-8 pt-0 flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1 rounded-xl text-xs uppercase font-bold" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 bg-[#4A5D45] text-white rounded-xl h-12 text-xs uppercase font-bold" disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-8 animate-pulse text-left">
        <div className="h-10 bg-[#E9E9E0] rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-64 bg-white rounded-2xl" />
          <div className="lg:col-span-2 h-64 bg-white rounded-2xl" />
        </div>
      </div>
    </div>
  )
}