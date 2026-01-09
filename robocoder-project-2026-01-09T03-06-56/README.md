# E-commerce Formulaciones Di Rosa

E-commerce completo para cosmética magistral con sistema de pagos avanzado, logística automatizada y gestión de capacidad semanal.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Prisma ORM
- **Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación**: NextAuth.js
- **Pagos**: Mercado Pago + Transferencia bancaria + Tarjeta manual
- **Logística**: Correo Argentino + Andreani + Motomensajería

## 📦 Características Principales

### 🛍️ E-commerce Core
- Catálogo de productos con categorías múltiples
- Sistema de carrito con persistencia
- Checkout multi-paso con validaciones
- Gestión de stock y productos destacados
- Búsqueda y filtros avanzados

### 💳 Sistema de Pagos Avanzado
- **Mercado Pago**: Integración completa con webhook
- **Transferencia bancaria**: 10% descuento + expiración 1 hora
- **Tarjeta manual**: Tokenización segura sin almacenar datos
- **Cuotas sin interés**: Configurable desde admin
- **Cupones**: Sistema completo con validaciones

### 📊 Gestión de Capacidad
- **Capacidad semanal**: 17 pedidos por semana (configurable)
- **Fechas estimadas**: Cálculo automático según capacidad
- **Cola de producción**: Asignación automática de semanas

### 🎁 Marketing y Cupones
- **Cupón primera compra**: Banner automático con generación de código
- **Sistema de descuentos**: Porcentajes y montos fijos
- **Validaciones**: Anti-abuso, límites por usuario, fechas
- **Rate limiting**: Prevención de spam

### 📦 Logística (En desarrollo)
- **Correo Argentino**: Cotización + rótulos automáticos
- **Andreani**: Integración completa con tracking
- **Motomensajería**: Gestión manual con datos de contacto
- **Tracking**: Seguimiento automático de envíos

### 👤 Panel de Usuario
- **Mi cuenta**: Historial de pedidos y estados
- **Tracking**: Información de envíos en tiempo real
- **Autenticación**: Login/registro con NextAuth

### ⚙️ Panel de Administración
- **Productos**: CRUD completo con categorías múltiples
- **Pedidos**: Gestión de estados y exportación
- **Configuraciones**: Sistema centralizado de settings
- **Reportes**: Ventas por producto y análisis

## 🔧 Configuración e Instalación

### Prerrequisitos
- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/jessidirosa/formulaciones_di_rosa_website.git
cd formulaciones_di_rosa_website
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN="tu-access-token-de-mercadopago"
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="tu-public-key-de-mercadopago"

# Configuraciones del negocio
CAPACIDAD_SEMANAL=17
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Transferencia bancaria
TRANSFER_DISCOUNT_PERCENTAGE=10
TRANSFER_CBU="1234567890123456789012"
TRANSFER_ALIAS="formulaciones.di.rosa"
TRANSFER_TITULAR="Formulaciones Di Rosa"
TRANSFER_BANCO="Banco Ejemplo"
TRANSFER_CUIT="20-12345678-9"

# Cupones
FIRST_PURCHASE_COUPON_PERCENTAGE=10
FIRST_PURCHASE_COUPON_VALIDITY_DAYS=30

# Cron jobs
CRON_SECRET="tu-clave-secreta-para-cron"
```

4. **Configurar base de datos**
```bash
# Ejecutar migraciones
npx prisma migrate dev

# Poblar con datos de ejemplo (opcional)
npx prisma db seed
```

5. **Ejecutar en desarrollo**
```bash
pnpm dev
```

6. **Build para producción**
```bash
pnpm build
pnpm start
```

## 🔐 Credenciales por Defecto

Después de ejecutar el seed:

- **Admin**: admin@formulacionesdirosa.com / admin123
- **Usuario test**: cliente@ejemplo.com / usuario123
- **Cupón de prueba**: BIENVENIDO10 (10% descuento)

## 💳 Configuración de Pagos

### Mercado Pago

1. **Obtener credenciales**:
   - Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
   - Crear aplicación
   - Obtener Access Token y Public Key

2. **Configurar webhook**:
   - URL: `https://tu-dominio.com/api/mercadopago/webhook`
   - Eventos: `payment`

3. **Cuotas sin interés**:
   - Configurar desde el panel de admin
   - Máximo 3 cuotas por defecto

### Transferencia Bancaria

- **Descuento automático**: 10% (configurable)
- **Expiración**: 1 hora automática
- **Datos bancarios**: Configurables desde admin
- **Estados**: `pending_payment_transfer` → `cancelled_expired`

### Tarjeta Manual

- **Tokenización**: Sin almacenar PAN/CVV
- **Validaciones**: Luhn algorithm + fecha + CVV
- **Cuotas**: 1, 3, 6, 12 (configurable)
- **Procesamiento**: Simulado (integrar con proveedor real)

## 📦 Sistema de Logística

### Capacidad Semanal

```typescript
// Configuración en .env
CAPACIDAD_SEMANAL=17

// Cálculo automático de fechas
const semanasNecesarias = Math.floor(pedidosPendientes / capacidadSemanal)
const fechaEstimada = new Date()
fechaEstimada.setDate(fechaEstimada.getDate() + semanasNecesarias * 7 + 3)
```

### Métodos de Envío

- **Retiro en local**: Sin costo
- **Envío a domicilio**: $9,500 (gratis > $200,000)
- **Sucursal Correo**: $7,000 (gratis > $200,000)
- **Motomensajería**: Costo coordinado

## 🎁 Sistema de Cupones

### Tipos de Cupones

```typescript
// Porcentaje
{
  tipo: 'percentage',
  valor: 10, // 10%
  maximoDescuento: 10000 // Máximo $10,000
}

// Monto fijo
{
  tipo: 'fixed_amount',
  valor: 5000 // $5,000 fijo
}
```

### Validaciones

- **Primera compra**: Verificación automática
- **Límites por usuario**: Configurable
- **Fechas de vigencia**: Inicio y vencimiento
- **Monto mínimo**: Configurable por cupón
- **Rate limiting**: 3 cupones por IP cada 15 minutos

## 🔄 Jobs y Automatización

### Cron Job - Expiración de Transferencias

```bash
# Ejecutar cada 5 minutos
curl -X GET https://tu-dominio.com/api/cron/expire-orders \
  -H "Authorization: Bearer tu-cron-secret"
```

**Funciones**:
- Cancela pedidos de transferencia expirados (>1 hora)
- Libera stock reservado
- Limpia cupones antiguos (>30 días)

### Estados de Pedidos

```typescript
// Estados principales
'pendiente' → 'pagado' → 'en_produccion' → 'listo_envio' → 'enviado' → 'entregado'

// Estados especiales
'pending_payment_transfer' → 'cancelled_expired' (si expira)
'pago_rechazado' → 'cancelado'
```

## 🧪 Testing

### APIs Críticas

```bash
# Test cupón primera compra
curl -X POST http://localhost:3000/api/cupones/generate-first-purchase \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test validación cupón
curl -X POST http://localhost:3000/api/cupones/validate \
  -H "Content-Type: application/json" \
  -d '{"codigo": "BIENVENIDO10", "subtotal": 10000, "email": "test@example.com"}'

# Test expiración de pedidos
curl -X GET http://localhost:3000/api/cron/expire-orders \
  -H "Authorization: Bearer dev-secret"

# Test configuraciones admin (requiere autenticación)
curl -X GET http://localhost:3000/api/admin/configuracion \
  -H "Cookie: next-auth.session-token=tu-session-token"

# Test cotización de envíos
curl -X POST http://localhost:3000/api/shipping/quote \
  -H "Content-Type: application/json" \
  -d '{"destination": {"street": "Av. Corrientes 1234", "city": "Buenos Aires", "state": "Buenos Aires", "zipCode": "1000", "country": "Argentina"}, "packageInfo": {"declaredValue": 15000}}'

# Test puntos de retiro
curl -X GET "http://localhost:3000/api/shipping/pickup-points?carrier=andreani&zipCode=1000&city=Buenos%20Aires"

# Test tracking (requiere tracking number válido)
curl -X GET http://localhost:3000/api/shipping/tracking/AND12345678
```

### Flujo de Compra Completo

1. **Agregar productos al carrito**
2. **Ir a checkout** → Datos personales
3. **Seleccionar envío** → Opciones de entrega
4. **Aplicar cupón** (opcional)
5. **Seleccionar método de pago**:
   - Mercado Pago → Redirección
   - Transferencia → Datos bancarios + timer
   - Tarjeta manual → Formulario tokenizado
6. **Confirmación** → Email + tracking

## 🔧 Arquitectura

### Estructura de Directorios

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── admin/         # APIs de administración
│   │   ├── auth/          # Autenticación
│   │   ├── checkout/      # Proceso de compra
│   │   ├── cupones/       # Sistema de cupones
│   │   ├── cron/          # Jobs automatizados
│   │   ├── mercadopago/   # Webhook MP
│   │   ├── payments/      # Procesamiento de pagos
│   │   └── productos/     # Gestión de productos
│   ├── admin/             # Panel de administración
│   ├── checkout/          # Proceso de compra
│   ├── mi-cuenta/         # Panel de usuario
│   └── tienda/            # Catálogo público
├── components/            # Componentes reutilizables
│   ├── admin/            # Componentes de admin
│   ├── checkout/         # Componentes de checkout
│   ├── marketing/        # Componentes de marketing
│   ├── pedidos/          # Componentes de pedidos
│   ├── productos/        # Componentes de productos
│   └── ui/               # Componentes base (shadcn)
├── contexts/             # Context API (carrito, usuario)
├── hooks/                # Custom hooks
└── lib/                  # Utilidades y configuración
    ├── auth.ts           # Configuración NextAuth
    ├── config.ts         # Sistema de configuración
    ├── constants.ts      # Enums y constantes
    ├── mercadopago.ts    # Cliente Mercado Pago
    ├── prisma.ts         # Cliente Prisma
    └── utils.ts          # Utilidades generales
```

### Base de Datos

**Modelos principales**:
- `User`: Usuarios del sistema
- `Producto`: Catálogo de productos
- `Categoria`: Categorías de productos
- `Pedido`: Órdenes de compra
- `Cupon`: Sistema de cupones
- `Configuracion`: Settings del sistema

**Relaciones**:
- Productos ↔ Categorías (N:N)
- Usuario → Pedidos (1:N)
- Pedido → Items (1:N)
- Cupón → Usos (1:N)

## 🚀 Deployment

### Variables de Entorno Requeridas

```env
# Esenciales
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="clave-super-secreta"
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="APP_USR-..."

# Configuraciones
CAPACIDAD_SEMANAL=17
TRANSFER_DISCOUNT_PERCENTAGE=10
FIRST_PURCHASE_COUPON_PERCENTAGE=10
CRON_SECRET="clave-para-cron-jobs"
```

### Cron Jobs en Producción

Configurar en tu proveedor de hosting:

```bash
# Cada 5 minutos - Expirar transferencias
*/5 * * * * curl -X GET https://tu-dominio.com/api/cron/expire-orders -H "Authorization: Bearer tu-cron-secret"
```

## 🔒 Seguridad

- **Autenticación**: JWT con NextAuth.js
- **Autorización**: Roles de usuario (USER/ADMIN)
- **Pagos**: Tokenización, sin almacenar datos sensibles
- **Rate limiting**: APIs de cupones y registro
- **Validaciones**: Server-side en todas las APIs
- **CORS**: Configurado para dominio específico

## 📱 Responsive Design

- **Mobile-first**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl
- **Componentes**: 100% responsive con Tailwind
- **Touch-friendly**: Botones y formularios optimizados

## 🎨 Paleta de Colores

```css
/* Colores principales */
--primary: #c7ca65    /* Verde oliva claro */
--secondary: #d1d08f  /* Verde oliva suave */
--accent: #82801a     /* Verde oliva oscuro */
--background: #d6d8b8 /* Beige verdoso */

/* Aplicación */
.bg-primary { background-color: #c7ca65; }
.text-primary { color: #82801a; }
.border-primary { border-color: #d1d08f; }
```

## 🐛 Bugs Corregidos

1. **✅ Descripción sin saltos de línea**: Implementado `white-space: pre-line`
2. **✅ Eliminación de categorías**: Verificación de productos asociados
3. **✅ Búsqueda de pedidos**: Búsqueda por ID, número y email
4. **✅ Página pedido enviado**: Componente de tracking integrado

## 🔄 Próximas Funcionalidades

- [ ] **Logística completa**: APIs de Correo Argentino y Andreani
- [ ] **Panel de configuración**: Admin UI para todas las settings
- [ ] **Notificaciones**: Email y WhatsApp automáticos
- [ ] **Analytics**: Dashboard de ventas y métricas
- [ ] **SEO**: Optimización completa
- [ ] **PWA**: Aplicación web progresiva

## 📞 Soporte

- **Email**: info@formulacionesdirosa.com
- **WhatsApp**: +54 11 2233-4455
- **Documentación**: Ver `/docs` en el proyecto

---

**Desarrollado con ❤️ para Formulaciones Di Rosa**
