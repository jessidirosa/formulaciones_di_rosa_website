import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@formulacionesdirosa.com' },
    update: {},
    create: {
      email: 'admin@formulacionesdirosa.com',
      password: adminPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      telefono: '+541122334455',
      esAdmin: true
    }
  })
  console.log('✅ Usuario admin creado:', admin.email)

  // 2. Crear usuario de prueba
  const userPassword = await bcrypt.hash('usuario123', 12)
  const testUser = await prisma.usuario.upsert({
    where: { email: 'cliente@ejemplo.com' },
    update: {},
    create: {
      email: 'cliente@ejemplo.com',
      password: userPassword,
      nombre: 'María',
      apellido: 'González',
      telefono: '+541134567890',
      esAdmin: false
    }
  })
  console.log('✅ Usuario test creado:', testUser.email)

  // 3. Crear productos de ejemplo
  const productos = [
    {
      nombre: 'Crema Antiage con Retinol Natural',
      slug: 'crema-antiage-retinol-natural',
      descripcionCorta: 'Crema con retinol natural que estimula la renovación celular',
      descripcionLarga: 'Crema facial antiage formulada con retinol de origen natural que estimula la renovación celular, reduce las líneas de expresión y mejora la textura de la piel. Ideal para pieles maduras que buscan prevenir y tratar los signos del envejecimiento.',
      categoria: 'Antiage',
      precio: 12500,
      imagen: 'https://placehold.co/500x500?text=Crema+Antiage+Retinol+Natural',
      beneficios: 'Reduce arrugas|Estimula colágeno|Mejora textura|Antioxidante',
      modoUso: 'Aplicar por las noches sobre rostro limpio. Usar protector solar durante el día.',
      tiposPiel: 'Normal|Mixta|Madura',
      destacado: true,
      stock: 25
    },
    {
      nombre: 'Serum Antimanchas con Vitamina C',
      slug: 'serum-antimanchas-vitamina-c',
      descripcionCorta: 'Serum concentrado que unifica el tono y reduce manchas',
      descripcionLarga: 'Serum facial con alta concentración de vitamina C estabilizada que ayuda a unificar el tono de la piel, reduce las manchas y aporta luminosidad. Su fórmula magistral está diseñada para maximizar la absorción y eficacia.',
      categoria: 'Manchas',
      precio: 9800,
      imagen: 'https://placehold.co/500x500?text=Serum+Vitamina+C+Antimanchas',
      beneficios: 'Reduce manchas|Unifica tono|Aporta luminosidad|Antioxidante',
      modoUso: 'Aplicar 2-3 gotas por la mañana sobre rostro limpio antes de la crema.',
      tiposPiel: 'Todos los tipos|Con manchas|Opaca',
      destacado: true,
      stock: 30
    },
    {
      nombre: 'Shampoo Fortalecedor Natural',
      slug: 'shampoo-fortalecedor-natural',
      descripcionCorta: 'Shampoo libre de sulfatos que fortalece desde la raíz',
      descripcionLarga: 'Shampoo formulado sin sulfatos ni parabenos, enriquecido con extractos naturales que fortalecen el cabello desde la raíz. Ideal para cabellos débiles, quebradizos o con tendencia a la caída.',
      categoria: 'Capilar',
      precio: 7200,
      imagen: 'https://placehold.co/500x500?text=Shampoo+Natural+Fortalecedor',
      beneficios: 'Fortalece cabello|Sin sulfatos|Reduce caída|100% natural',
      modoUso: 'Aplicar sobre cabello húmedo, masajear suavemente y enjuagar.',
      tiposPiel: 'Cabello débil|Cabello graso|Cabello normal',
      destacado: true,
      stock: 40
    },
    {
      nombre: 'Crema Hidratante Corporal',
      slug: 'crema-hidratante-corporal',
      descripcionCorta: 'Hidratación profunda para todo el cuerpo',
      descripcionLarga: 'Crema corporal con fórmula rica en mantecas naturales y aceites esenciales que proporciona hidratación profunda y duradera. Textura no grasa de rápida absorción.',
      categoria: 'Corporal',
      precio: 8500,
      imagen: 'https://placehold.co/500x500?text=Crema+Hidratante+Corporal',
      beneficios: 'Hidratación 24h|Textura ligera|Aroma natural|Piel suave',
      modoUso: 'Aplicar sobre piel limpia y seca realizando masajes hasta completa absorción.',
      tiposPiel: 'Piel seca|Piel sensible|Todos los tipos',
      destacado: false,
      stock: 35
    },
    {
      nombre: 'Gel Limpiador Facial Purificante',
      slug: 'gel-limpiador-purificante',
      descripcionCorta: 'Limpieza profunda para pieles grasas y mixtas',
      descripcionLarga: 'Gel limpiador facial formulado especialmente para pieles grasas y mixtas. Remueve impurezas sin resecar, equilibra la producción de sebo y deja la piel fresca y purificada.',
      categoria: 'Limpieza',
      precio: 6800,
      imagen: 'https://placehold.co/500x500?text=Gel+Limpiador+Purificante',
      beneficios: 'Limpia profundamente|Controla grasa|No reseca|pH balanceado',
      modoUso: 'Aplicar sobre rostro húmedo, masajear suavemente y enjuagar con agua tibia.',
      tiposPiel: 'Grasa|Mixta|Con acné',
      destacado: false,
      stock: 28
    },
    {
      nombre: 'Mascarilla Nutritiva de Arcilla',
      slug: 'mascarilla-nutritiva-arcilla',
      descripcionCorta: 'Mascarilla purificante y nutritiva',
      descripcionLarga: 'Mascarilla facial a base de arcillas naturales enriquecida con aceites vegetales. Purifica los poros en profundidad mientras nutre y suaviza la piel.',
      categoria: 'Mascarillas',
      precio: 5900,
      imagen: 'https://placehold.co/500x500?text=Mascarilla+Arcilla+Natural',
      beneficios: 'Purifica poros|Nutre la piel|Textura suave|100% natural',
      modoUso: 'Aplicar capa uniforme, dejar actuar 15-20 minutos y retirar con agua tibia.',
      tiposPiel: 'Grasa|Mixta|Con poros dilatados',
      destacado: false,
      stock: 20
    }
  ]

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { slug: producto.slug },
      update: producto,
      create: producto
    })
  }
  console.log('✅ Productos creados:', productos.length)

  // 4. Crear configuraciones del sistema
  const configuraciones = [
    {
      clave: 'CAPACIDAD_SEMANAL',
      valor: '17',
      descripcion: 'Cantidad máxima de pedidos que se pueden procesar por semana',
      tipo: 'number'
    },
    {
      clave: 'EMPRESA_NOMBRE',
      valor: 'Formulaciones Di Rosa',
      descripcion: 'Nombre de la empresa',
      tipo: 'string'
    },
    {
      clave: 'EMPRESA_WHATSAPP',
      valor: '+541122334455',
      descripcion: 'Número de WhatsApp de contacto',
      tipo: 'string'
    },
    {
      clave: 'EMPRESA_EMAIL',
      valor: 'info@formulacionesdirosa.com',
      descripcion: 'Email de contacto principal',
      tipo: 'string'
    },
    {
      clave: 'ENVIO_GRATIS_MINIMO',
      valor: '15000',
      descripcion: 'Monto mínimo para envío gratis',
      tipo: 'number'
    },
    {
      clave: 'COSTO_ENVIO_NACIONAL',
      valor: '2500',
      descripcion: 'Costo de envío nacional estándar',
      tipo: 'number'
    }
  ]

  for (const config of configuraciones) {
    await prisma.configuracion.upsert({
      where: { clave: config.clave },
      update: config,
      create: config
    })
  }
  console.log('✅ Configuraciones creadas:', configuraciones.length)

  // 5. Crear cupones de ejemplo
  const cupon = await prisma.cupon.upsert({
    where: { codigo: 'BIENVENIDO10' },
    update: {},
    create: {
      codigo: 'BIENVENIDO10',
      descripcion: 'Descuento de bienvenida del 10%',
      tipo: 'PORCENTAJE',
      valor: 10,
      montoMinimo: 5000,
      fechaVencimiento: new Date('2025-12-31'),
      activo: true,
      limiteUsos: 100
    }
  })
  console.log('✅ Cupón creado:', cupon.codigo)

  console.log('🎉 Seed completado exitosamente!')
  console.log('')
  console.log('👤 Credenciales de acceso:')
  console.log('   Admin: admin@formulacionesdirosa.com / admin123')
  console.log('   Usuario: cliente@ejemplo.com / usuario123')
  console.log('')
  console.log('🎁 Cupón de prueba: BIENVENIDO10 (10% de descuento)')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })