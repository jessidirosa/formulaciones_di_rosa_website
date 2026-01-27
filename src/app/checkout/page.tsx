'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import ShippingOptions from '@/components/checkout/ShippingOptions'
import PaymentSection from '@/components/checkout/PaymentSection'
import OrderSummary from '@/components/checkout/OrderSummary'
import EstimatedDate from '@/components/carrito/EstimatedDate'
import { ArrowLeft, Lock, CreditCard, ShieldCheck } from 'lucide-react'

export interface CheckoutData {
  nombre: string
  apellido: string
  emailCliente: string
  telefono: string
  dni?: string
  direccion?: string
  ciudad?: string
  localidad?: string
  provincia?: string
  codigoPostal?: string
  metodoPago?: 'MERCADOPAGO' | 'TRANSFERENCIA' | 'TARJETA'
  aplicarDescuentoTransfer?: boolean
  cuotasMP?: number
  tipoEntrega: 'RETIRO_LOCAL' | 'ENVIO_DOMICILIO' | 'SUCURSAL_CORREO' | 'MOTOMENSAJERIA'
  carrier?: 'CORREO_ARGENTINO' | 'ANDREANI'
  sucursalId?: string
  sucursalNombre?: string
  carrierService?: string
  sucursalCorreo?: string
  cuponCodigo?: string
  cuponDescuento?: number
  notas?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state, clearCart } = useCart()
  const { isAuthenticated, user } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [costoEnvio, setCostoEnvio] = useState(0)

  // ✅ Estado inicializado correctamente con los nombres de la interfaz
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    nombre: '',
    apellido: '',
    emailCliente: '',
    telefono: '',
    dni: '',
    direccion: '',
    localidad: '',
    provincia: '',
    codigoPostal: '',
    metodoPago: 'MERCADOPAGO',
    aplicarDescuentoTransfer: false,
    cuotasMP: 1,
    tipoEntrega: 'RETIRO_LOCAL',
    carrier: 'CORREO_ARGENTINO',
    sucursalId: '',
    sucursalNombre: '',
    cuponCodigo: '',
    cuponDescuento: 0
  })

  // ✅ Efecto para cargar datos del usuario logueado
  useEffect(() => {
    if (user) {
      setCheckoutData(prev => ({
        ...prev,
        nombre: prev.nombre || user.nombre || '',
        apellido: prev.apellido || user.apellido || '',
        emailCliente: prev.emailCliente || user.email || '',
        telefono: prev.telefono || user.telefono || '',
      }))
    }
  }, [user])

  // ✅ Lógica de costo de envío
  useEffect(() => {
    const ENVIO_GRATIS_MINIMO = 200000
    const COSTO_SUCURSAL = 7000
    const COSTO_DOMICILIO = 9500

    if (checkoutData.tipoEntrega === 'RETIRO_LOCAL') {
      setCostoEnvio(0)
    } else if (checkoutData.tipoEntrega === 'ENVIO_DOMICILIO') {
      setCostoEnvio(state.total >= ENVIO_GRATIS_MINIMO ? 0 : COSTO_DOMICILIO)
    } else if (checkoutData.tipoEntrega === 'SUCURSAL_CORREO') {
      setCostoEnvio(state.total >= ENVIO_GRATIS_MINIMO ? 0 : COSTO_SUCURSAL)
    } else if (checkoutData.tipoEntrega === 'MOTOMENSAJERIA') {
      setCostoEnvio(0)
    }
  }, [checkoutData.tipoEntrega, state.total])

  const subtotal = state.total
  const cuponDescuento = checkoutData.cuponDescuento || 0
  const transferDiscount = checkoutData.aplicarDescuentoTransfer ? Math.round(subtotal * 0.10) : 0
  const descuentoTotal = cuponDescuento + transferDiscount
  const totalFinal = subtotal + costoEnvio - descuentoTotal

  const updateCheckoutData = (update: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...update }))
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    try {
      const items = state.items.map(item => ({
        productoId: Number(item.producto.id),
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        subtotal: item.producto.precio * item.cantidad,
        nombreProducto: item.producto.nombre,
        categoriaProducto: item.producto.categoria,
      }))

      const orderData = {
        nombreCliente: checkoutData.nombre,
        apellidoCliente: checkoutData.apellido,
        emailCliente: checkoutData.emailCliente,
        telefonoCliente: checkoutData.telefono,
        dniCliente: checkoutData.dni,
        direccion: checkoutData.direccion,
        localidad: checkoutData.localidad,
        provincia: checkoutData.provincia,
        codigoPostal: checkoutData.codigoPostal,
        carrier: checkoutData.carrier,
        sucursalId: checkoutData.sucursalId,
        sucursalNombre: checkoutData.sucursalNombre,
        metodoPago: checkoutData.metodoPago,
        aplicarDescuentoTransfer: checkoutData.aplicarDescuentoTransfer,
        descuento: descuentoTotal,
        tipoEntrega: checkoutData.tipoEntrega,
        subtotal,
        costoEnvio,
        total: totalFinal,
        items,
        cuponCodigo: checkoutData.cuponCodigo || null
      }

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (response.ok && (result.ok || result.success)) {
        clearCart()
        if (checkoutData.metodoPago === 'TRANSFERENCIA') {
          router.push(`/checkout/transferencia/${result.pedidoId}`)
        } else {
          const mpUrl = result.initPoint || result.mercadoPagoUrl
          if (mpUrl) window.location.href = mpUrl
          else router.push(`/checkout/confirmacion/${result.pedidoId}`)
        }
      }
    } catch (error) {
      console.error('Error en checkout:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (state.items.length === 0) return null

  const steps = [
    { number: 1, title: 'Datos personales', completed: currentStep > 1 },
    { number: 2, title: 'Entrega', completed: currentStep > 2 },
    { number: 3, title: 'Pago', completed: false }
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 mb-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/carrito')}
            className="rounded-full bg-white hover:bg-[#E9E9E0] text-[#4A5D45] h-12 w-12 p-0 shadow-sm"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#3A4031]">Finalizar Pedido</h1>
            <p className="text-[#5B6350] font-medium italic">Laboratorio Di Rosa — Transacción Protegida</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#D6D6C2] -translate-y-1/2 z-0"></div>
            {steps.map((step) => (
              <div key={step.number} className="relative z-10 flex flex-col items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-500 shadow-sm ${currentStep === step.number ? 'bg-[#4A5D45] border-[#A3B18A] text-white scale-110' :
                    step.completed ? 'bg-[#A3B18A] border-[#A3B18A] text-white' : 'bg-white border-[#D6D6C2] text-[#D6D6C2]'
                  }`}>
                  {step.completed ? '✓' : step.number}
                </div>
                <span className={`absolute -bottom-8 text-xs font-bold uppercase tracking-widest min-w-max ${currentStep >= step.number ? 'text-[#4A5D45]' : 'text-[#D6D6C2]'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-20">
          <div className="lg:col-span-2 space-y-8 text-left">
            <Card className="border-none shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-[#F5F5F0] p-6">
                <CardTitle className="flex items-center gap-4 text-[#3A4031]">
                  <span className="w-8 h-8 bg-[#4A5D45] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {currentStep}
                  </span>
                  {steps[currentStep - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                {currentStep === 1 && (
                  <CheckoutForm data={checkoutData} onChange={updateCheckoutData} onNext={() => setCurrentStep(2)} />
                )}
                {currentStep === 2 && (
                  <ShippingOptions data={checkoutData} onChange={updateCheckoutData} onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />
                )}
                {currentStep === 3 && (
                  <PaymentSection data={checkoutData} onChange={updateCheckoutData} onSubmit={handleSubmit} onBack={() => setCurrentStep(2)} isProcessing={isProcessing} total={totalFinal} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <EstimatedDate fechaEstimada={state.fechaEstimada} />
            <OrderSummary items={state.items} subtotal={subtotal} costoEnvio={costoEnvio} descuento={descuentoTotal} total={totalFinal} tipoEntrega={checkoutData.tipoEntrega} />
          </div>
        </div>
      </div>
    </div>
  )
}