# TODO - E-commerce Formulaciones Di Rosa

## ✅ Progreso del Proyecto

### 📋 Fase 1: Configuración Base y Dependencies
- [x] Instalar dependencias adicionales (Prisma, Mercado Pago, bcryptjs, etc.)
- [x] Configurar Prisma con SQLite
- [x] Crear schema de base de datos completo
- [x] Configurar variables de entorno
- [x] Ejecutar migraciones y seed inicial (pendiente por problemas de Prisma 7)

### 🎨 Fase 2: Layout y Componentes Base
- [x] Crear layout principal con Header y Footer
- [x] Implementar componentes UI base (Button, Input, Card, etc.)
- [x] Configurar Context para carrito y usuario
- [x] Implementar sistema de autenticación

### 🛍️ Fase 3: Funcionalidades de E-commerce
- [x] Página de inicio con hero y productos destacados
- [x] Catálogo de productos con filtros y búsqueda
- [x] Detalle de producto individual
- [x] Sistema de carrito completo
- [x] Proceso de checkout con formulario

### 💳 Fase 4: Integración Mercado Pago
- [x] Configurar SDK de Mercado Pago
- [x] Implementar creación de preferencias
- [x] Crear webhook para notificaciones
- [x] Manejo de estados de pago

### 📊 Fase 5: Sistema de Capacidad y Fechas
- [x] Implementar lógica de cálculo de fecha estimada
- [x] Mostrar fechas en producto, carrito y checkout
- [x] Sistema de capacidad semanal (17 pedidos)

### 👤 Fase 6: Panel de Usuario y Admin
- [x] Panel Mi Cuenta con historial
- [x] Login y registro de usuarios
- [ ] Panel admin para productos
- [ ] Gestión de pedidos en admin
- [ ] Vista de capacidad semanal

### 📄 Fase 7: Páginas Informativas
- [ ] Sobre nosotros
- [ ] Contacto con WhatsApp
- [ ] Políticas y términos
- [ ] Preguntas frecuentes

### 🔧 Fase 8: Testing y Optimización
- [ ] **AUTOMATIC**: Process placeholder images (placehold.co URLs) → AI-generated images
  - This step executes automatically when placeholders are detected
  - No manual action required - system triggers automatically
  - Ensures all images are ready before testing
- [ ] Construcción del proyecto (`pnpm run build --no-lint`)
- [ ] Testing de APIs con curl
- [ ] Testing de flujo completo de compra
- [ ] Optimización y ajustes finales

---
**Proyecto**: E-commerce Formulaciones Di Rosa  
**Stack**: Next.js + TypeScript + Prisma + Mercado Pago  
**Características especiales**: Sistema de capacidad semanal, fechas estimadas automáticas