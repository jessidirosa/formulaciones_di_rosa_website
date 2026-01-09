# TODO - E-commerce Formulaciones Di Rosa - DESARROLLO INCREMENTAL

## 🎯 PROGRESO DEL PROYECTO

### ✅ FASE 1: CORRECCIÓN DE BUGS CRÍTICOS
- [x] **Bug 1**: Descripción sin saltos de línea
  - [x] Modificar renderizado en ProductDetail.tsx (white-space: pre-line)
  - [x] Actualizar admin para entrada multilinea con Textarea
  - [x] Sanitizar entrada para prevenir XSS
- [x] **Bug 2**: Eliminación de categorías (solo última)
  - [x] Corregir lógica en /api/admin/categorias/[id]/route.ts
  - [x] Verificar productos asociados antes de eliminar
  - [x] Implementar mensaje claro cuando hay productos asociados
- [x] **Bug 3**: Búsqueda de pedidos por ID
  - [x] Arreglar validación en admin/pedidos/page.tsx
  - [x] Mejorar query con OR para ID, número y email
  - [x] Agregar búsqueda por email del cliente
- [x] **Bug 4**: Página pedido enviado sin tracking
  - [x] Crear componente TrackingInfo para mostrar tracking
  - [x] Integrar con página de confirmación de pedido

### 🎁 FASE 2: SISTEMA DE DESCUENTOS Y CUPONES
- [x] **Modelo de datos**
  - [x] Crear tabla Cupon en Prisma schema
  - [x] Crear tabla EmailCupon para marketing
  - [x] Actualizar modelo Pedido con campos de descuento
  - [x] Crear tabla CuponUso para tracking
  - [x] Crear tabla Configuracion para settings
- [x] **Lógica de cálculo**
  - [x] API de validación de cupones mejorada
  - [x] Implementar reglas de acumulación
  - [x] Validación de cupones server-side con email
  - [x] Verificación de primera compra
- [x] **Marketing: Cupón primera compra**
  - [x] Modal/banner para captura de email
  - [x] Generación automática de cupón
  - [x] Rate limiting y validaciones
  - [x] Integración en página principal

### 💰 FASE 3: TRANSFERENCIA BANCARIA + EXPIRACIÓN
- [x] **Método de pago transferencia**
  - [x] Agregar opción en checkout con TransferPaymentOption
  - [x] Mostrar datos bancarios configurables
  - [x] Aplicar descuento 10% automático
  - [x] Timer visual de 1 hora
  - [x] Funciones de copiar CBU/Alias/Monto
- [x] **Sistema de expiración 1 hora**
  - [x] API para cancelar pedidos expirados
  - [x] Estados: pending_payment_transfer, cancelled_expired
  - [x] Script de cron job para automatización
  - [x] Configuración de expiresAt en pedidos
- [x] **Descuento transferencia + Mercado Pago**
  - [x] Mantener descuento si paga por MP (metadata)
  - [x] Sistema de configuración centralizada
  - [x] Persistir discount_type=transfer_10
  - [x] Integración completa en checkout

### 💳 FASE 4: MERCADO PAGO AVANZADO + TARJETA MANUAL
- [x] **Mejoras Mercado Pago**
  - [x] Mejorar webhook con idempotencia (/api/mercadopago/webhook)
  - [x] Mapeo correcto de estados de pago
  - [x] Cache de eventos procesados (anti-duplicación)
  - [x] Metadata con información de descuentos
  - [ ] Implementar "3 cuotas sin interés" (configuración admin)
- [x] **Tarjeta manual tokenizada**
  - [x] Checkout con tarjeta manual (ManualCardPayment)
  - [x] Tokenización simulada (sin almacenar PAN/CVV)
  - [x] Validaciones completas (Luhn, fecha, CVV)
  - [x] API de procesamiento (/api/payments/manual-card)
  - [x] UX mejorada con detección de marca
- [x] **Estados de pedido y pagos**
  - [x] Definir enums para estados (constants.ts)
  - [x] Reconciliación correcta de webhooks
  - [x] Manejo de errores robusto
  - [x] Labels para mostrar al usuario
  - [x] Campos adicionales en modelo Pedido

### 📦 FASE 5: LOGÍSTICA + RÓTULOS AUTOMÁTICOS
- [x] **Integración APIs**
  - [x] Correo Argentino API (CorreoArgentinoService)
  - [x] Andreani API (AndreaniService)
  - [x] Capa abstraída con adapters (CarrierService interface)
  - [x] Manager centralizado (CarrierManager)
- [x] **Funcionalidades**
  - [x] Cotizar envío por CP/peso (/api/shipping/quote)
  - [x] Crear envío automático (/api/shipping/create)
  - [x] Generar rótulos (PDF/ZPL) - URLs automáticas
  - [x] Tracking automático (/api/shipping/tracking/[trackingNumber])
  - [x] Puntos de retiro (/api/shipping/pickup-points)
- [x] **Motomensajería**
  - [x] Servicio de moto (MotorcycleService)
  - [x] Datos: empresa, teléfono, costo, ventana
  - [x] Gestión desde admin (MotorcycleManager)
  - [x] API específica (/api/admin/pedidos/[id]/moto)
  - [x] Componente de administración (ShippingManager)

### 👤 FASE 6: MI CUENTA + TRACKING
- [x] **Dashboard usuario**
  - [x] Listado de pedidos con estados actualizados
  - [x] Información de envío y tracking
  - [x] Semana estimada de entrega
  - [x] Badges de estado mejorados
  - [x] Información de método de pago
- [x] **Detalle de pedido**
  - [x] Timeline de estados (/mi-cuenta/pedidos/[id])
  - [x] Información de tracking completa
  - [x] Desglose de costos y descuentos
  - [x] Integración con TrackingInfo component
  - [x] API actualizada con campos de tracking

### ⚙️ FASE 7: ADMIN MEJORADO + CONFIGURACIONES
- [x] **Configuraciones centralizadas**
  - [x] Panel de configuración (/admin/configuracion)
  - [x] Datos de transferencia bancaria
  - [x] Descuentos y cupones
  - [x] Cuotas sin interés de Mercado Pago
  - [x] Costos de envío y envío gratis
  - [x] Capacidad semanal
  - [x] API de configuración con validaciones
- [x] **Exportaciones mejoradas**
  - [x] CSV con todos los campos nuevos
  - [x] Campos de pago, descuentos, tracking
  - [x] Información de motomensajería
  - [x] Datos completos de logística
- [x] **Gestión de envíos**
  - [x] ShippingManager para carriers
  - [x] MotorcycleManager para motos
  - [x] Integración en panel de pedidos

### 📱 FASE 8: RESPONSIVE + MOBILE POLISH
- [x] **Mobile-first**
  - [x] Navbar responsive con menú hamburguesa
  - [x] Checkout móvil perfecto con progress bar
  - [x] Formularios optimizados para touch
  - [x] Botones full-width en móvil
- [x] **Paleta de colores**
  - [x] Implementar: #c7ca65, #d1d08f, #82801a, #d6d8b8
  - [x] Variables CSS personalizadas
  - [x] Configuración de Tailwind actualizada
  - [x] Contraste adecuado verificado
  - [x] UI minimalista y consistente

### 🧪 FASE 9: TESTING Y OPTIMIZACIÓN
- [x] **AUTOMATIC**: Process placeholder images (placehold.co URLs) → AI-generated images
  - This step executes automatically when placeholders are detected
  - No manual action required - system triggers automatically
  - Ensures all images are ready before testing
- [x] **Build y Testing**
  - [x] Construcción del proyecto (pnpm run build --no-lint) ✅
  - [x] Testing de APIs con curl ✅
    - Generación de cupones: 200 OK ✅
    - Validación de cupones: 200 OK ✅
    - Expiración de pedidos: 200 OK ✅
    - Configuración admin: 401 (protegida) ✅
    - Cotización de envíos: 200 OK ✅
    - Puntos de retiro: 200 OK ✅
  - [x] Servidor funcionando en puerto 3000 ✅
  - [x] Base de datos con migraciones aplicadas ✅
  - [x] Paleta de colores implementada ✅
  - [x] Responsive design verificado ✅

---
**Proyecto**: E-commerce Formulaciones Di Rosa - Desarrollo Incremental  
**Stack**: Next.js + TypeScript + Prisma + Mercado Pago + Logística  
**Objetivo**: Sostener existente + arreglar bugs + completar features clave