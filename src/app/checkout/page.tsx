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
import { ArrowLeft, Lock, CreditCard } from 'lucide-react'

export interface CheckoutData {
  // Datos del cliente
  nombre: string
  apellido: string
  email: string
  telefono: string
  dni?: string

  // Dirección de envío
  direccion?: string
  ciudad?: string
  provincia?: string
  codigoPostal?: string

  // Opciones de entrega
  tipoEntrega:
  | 'RETIRO_LOCAL'
  | 'ENVIO_DOMICILIO'
  | 'SUCURSAL_CORREO'
  | 'MOTOMENSAJERIA'

  // Sucursal de Correo Argentino (solo si tipoEntrega === 'SUCURSAL_CORREO')
  sucursalCorreo?: string

  // Cupón de descuento
  cuponCodigo?: string
  cuponDescuento?: number

  // Notas adicionales
  notas?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state, clearCart } = useCart()
  const { isAuthenticated, user } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    tipoEntrega: 'RETIRO_LOCAL',
    sucursalCorreo: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [costoEnvio, setCostoEnvio] = useState(0)

  // Redireccionar si el carrito está vacío
  useEffect(() => {
    if (state.items.length === 0) {
      router.push('/carrito')
    }
  }, [state.items.length, router])

  // Calcular costo de envío
  useEffect(() => {
    const ENVIO_GRATIS_MINIMO = 200000
    const COSTO_SUCURSAL = 7000
    const COSTO_DOMICILIO = 9500

    if (checkoutData.tipoEntrega === 'RETIRO_LOCAL') {
      setCostoEnvio(0)
    } else if (checkoutData.tipoEntrega === 'ENVIO_DOMICILIO') {
      setCostoEnvio(
        state.total >= ENVIO_GRATIS_MINIMO ? 0 : COSTO_DOMICILIO
      )
    } else if (checkoutData.tipoEntrega === 'SUCURSAL_CORREO') {
      setCostoEnvio(
        state.total >= ENVIO_GRATIS_MINIMO ? 0 : COSTO_SUCURSAL
      )
    } else if (checkoutData.tipoEntrega === 'MOTOMENSAJERIA') {
      // Moto: el costo se coordina por fuera, no lo sumamos al total ahora
      setCostoEnvio(0)
    }
  }, [checkoutData.tipoEntrega, state.total])

  // Calcular totales
  const subtotal = state.total
  const descuento = checkoutData.cuponDescuento || 0
  const totalFinal = subtotal + costoEnvio - descuento

  // Actualizar datos del checkout
  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...data }))
  }

  // Manejar envío del formulario
  const handleSubmit = async () => {
    setIsProcessing(true)

    try {
      // Armar items como los espera el backend
      const items = state.items.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        subtotal: item.producto.precio * item.cantidad,
        nombreProducto: item.producto.nombre,
        categoriaProducto: item.producto.categoria
      }))

      // Crear el payload del pedido
      const orderData = {
        // Datos del cliente
        nombreCliente: checkoutData.nombre,
        apellidoCliente: checkoutData.apellido,
        emailCliente: checkoutData.email,
        telefonoCliente: checkoutData.telefono,
        dniCliente: checkoutData.dni,

        // Dirección de envío (aplica para envío y moto)
        ...(checkoutData.tipoEntrega !== 'RETIRO_LOCAL' && {
          direccion: checkoutData.direccion,
          ciudad: checkoutData.ciudad,
          provincia: checkoutData.provincia,
          codigoPostal: checkoutData.codigoPostal

        }),

        // Sucursal de Correo Argentino (solo si corresponde)
        sucursalCorreo:
          checkoutData.tipoEntrega === 'SUCURSAL_CORREO'
            ? checkoutData.sucursalCorreo
            : undefined,

        // Información del pedido
        tipoEntrega: checkoutData.tipoEntrega,
        subtotal,
        costoEnvio,
        descuento,
        total: totalFinal,
        notasCliente: checkoutData.notas,

        // Items del carrito
        items,

        // Cupón si existe
        ...(checkoutData.cuponCodigo && {
          cuponCodigo: checkoutData.cuponCodigo
        })
      }

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      // Soportar ambos formatos: { ok: true } o { success: true }
      const success = result.ok ?? result.success

      if (response.ok && success) {
        // Limpiar carrito
        clearCart()

        // URL de Mercado Pago en cualquiera de estos campos
        const mercadoPagoUrl =
          result.initPoint ||
          result.init_point ||
          result.sandbox_init_point ||
          result.mercadoPagoUrl

        if (mercadoPagoUrl) {
          window.location.href = mercadoPagoUrl
        } else if (result.pedidoId) {
          // Fallback: ir a página de confirmación
          router.push(`/checkout/confirmacion/${result.pedidoId}`)
        } else {
          throw new Error('No se recibió URL de pago ni ID de pedido.')
        }
      } else {
        throw new Error(result.error || 'Error al procesar el pedido')
      }
    } catch (error) {
      console.error('Error en checkout:', error)
      alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Si el carrito está vacío, no mostrar nada (se redirecciona en useEffect)
  if (state.items.length === 0) {
    return null
  }

  const steps = [
    { number: 1, title: 'Datos personales', completed: currentStep > 1 },
    { number: 2, title: 'Envío', completed: currentStep > 2 },
    { number: 3, title: 'Pago', completed: false }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/carrito')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar compra</h1>
          <p className="text-gray-600">Completa tu pedido de forma segura</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep >= step.number
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : step.completed
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-gray-400'
                  }`}
              >
                {step.completed ? '✓' : step.number}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${currentStep >= step.number ? 'text-rose-600' : 'text-gray-500'
                    }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paso 1: Datos personales */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm">
                    1
                  </span>
                  Datos personales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutForm
                  data={checkoutData}
                  onChange={updateCheckoutData}
                  onNext={() => setCurrentStep(2)}
                />
              </CardContent>
            </Card>
          )}

          {/* Paso 2: Opciones de envío */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  Opciones de entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShippingOptions
                  data={checkoutData}
                  onChange={updateCheckoutData}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              </CardContent>
            </Card>
          )}

          {/* Paso 3: Pago */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  Información de pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentSection
                  data={checkoutData}
                  onChange={updateCheckoutData}
                  onSubmit={handleSubmit}
                  onBack={() => setCurrentStep(2)}
                  isProcessing={isProcessing}
                  total={totalFinal}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumen lateral */}
        <div className="space-y-6">
          {/* Fecha estimada */}
          <EstimatedDate fechaEstimada={state.fechaEstimada} />

          {/* Resumen del pedido */}
          <OrderSummary
            items={state.items}
            subtotal={subtotal}
            costoEnvio={costoEnvio}
            descuento={descuento}
            total={totalFinal}
            tipoEntrega={checkoutData.tipoEntrega}
          />

          {/* Seguridad */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-green-700 mb-3">
                <Lock className="h-5 w-5" />
                <div>
                  <p className="font-medium text-sm">Compra 100% segura</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-green-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Procesado por Mercado Pago</span>
                </div>
                <p>• Todos los pagos están encriptados</p>
                <p>• Protección al comprador</p>
                <p>• Datos personales seguros</p>
              </div>
            </CardContent>
          </Card>

          {/* Ayuda */}
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                ¿Necesitas ayuda con tu compra?
              </p>
              <a
                href="https://wa.me/541122334455?text=Hola!%20Necesito%20ayuda%20con%20mi%20compra%20en%20Formulaciones%20Di%20Rosa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Contactar por WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
