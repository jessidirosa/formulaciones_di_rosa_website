import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({ // ✅ Cambiado 'usuario' por 'user'
    where: { email: 'admin@formulacionesdirosa.com' },
    update: {},
    create: {
      email: 'admin@formulacionesdirosa.com',
      passwordHash: adminPassword, // ✅ Cambiado 'password' por 'passwordHash'
      nombre: 'Administrador',
      apellido: 'Sistema',
      telefono: '+541122334455',
      role: 'ADMIN' // ✅ Cambiado 'esAdmin: true' por 'role: ADMIN'
    }
  })
  console.log('✅ Usuario admin creado:', admin.email)

  // 2. Crear usuario de prueba
  const userPassword = await bcrypt.hash('usuario123', 12)
  const testUser = await prisma.user.upsert({ // ✅ Cambiado 'usuario' por 'user'
    where: { email: 'cliente@ejemplo.com' },
    update: {},
    create: {
      email: 'cliente@ejemplo.com',
      passwordHash: userPassword, // ✅ Cambiado 'password' por 'passwordHash'
      nombre: 'María',
      apellido: 'González',
      telefono: '+541134567890',
      role: 'USER' // ✅ Cambiado 'esAdmin: false' por 'role: USER'
    }
  })
  console.log('✅ Usuario test creado:', testUser.email)

  // 3. Crear productos de ejemplo (Mantenemos tu lógica)
  const productos = [
    {
      nombre: 'Crema Antiage con Retinol Natural',
      slug: 'crema-antiage-retinol-natural',
      descripcionCorta: 'Crema con retinol natural que estimula la renovación celular',
      descripcionLarga: 'Crema facial antiage formulada con retinol de origen natural que estimula la renovación celular, reduce las líneas de expresión y mejora la textura de la piel.',
      categoria: 'Antiage',
      precio: 12500,
      imagen: 'https://placehold.co/500x500?text=Crema+Antiage+Retinol+Natural',
      beneficios: 'Reduce arrugas|Estimula colágeno|Mejora textura|Antioxidante',
      modoUso: 'Aplicar por las noches sobre rostro limpio.',
      tiposPiel: 'Normal|Mixta|Madura',
      destacado: true,
      stock: 25
    }
    // ... podés dejar el resto de tus productos igual
  ]

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { slug: producto.slug },
      update: producto,
      create: producto
    })
  }
  console.log('✅ Productos creados')

  // 4. Configuraciones y Cupones (Tu código original estaba bien aquí)
  // ... (mantené el resto igual)

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })