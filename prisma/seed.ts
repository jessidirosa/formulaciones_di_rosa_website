import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear/Actualizar usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'formulacionesdr@gmail.com' },
    update: {
      passwordHash: adminPassword,
      telefono: '+5491137024467',
      nombre: 'Administrador',
      role: 'ADMIN'
    },
    create: {
      email: 'formulacionesdr@gmail.com',
      passwordHash: adminPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      telefono: '+5491137024467',
      role: 'ADMIN'
    }
  })
  console.log('✅ Usuario admin actualizado/creado:', admin.email)

  // 2. Crear una Categoría de prueba
  const categoriaTest = await prisma.categoria.upsert({
    where: { slug: 'cuidado-facial' },
    update: {},
    create: {
      nombre: 'Cuidado Facial',
      slug: 'cuidado-facial',
    }
  })
  console.log('✅ Categoría test creada:', categoriaTest.nombre)

  // 3. Crear un Producto de prueba con todos los campos del modelo
  // Usamos upsert para evitar duplicados si corrés el seed varias veces
  const productoTest = await prisma.producto.upsert({
    where: { slug: 'producto-test-magistral' },
    update: {},
    create: {
      nombre: 'Producto Test Magistral',
      slug: 'producto-test-magistral',
      descripcionCorta: 'Esta es una fórmula de prueba para validar el sistema.',
      descripcionLarga: 'Descripción detallada de la fórmula magistral de prueba para asegurar que los campos de texto funcionen correctamente en el frontend.',
      categoria: 'Rostro',
      precio: 1500.00,
      imagen: 'https://res.cloudinary.com/dj71ufqjc/image/upload/v1769795504/0ab35230-ec07-44d9-a20b-f14c293a21a6_gbzwe7.jpg',
      stock: 10,
      activo: true,
      destacado: true,
      orden: 1,
      // Relación N-a-N con Categoría
      categorias: {
        create: [
          {
            categoria: {
              connect: { id: categoriaTest.id }
            }
          }
        ]
      },
      // Relación 1-a-N con Presentaciones
      presentaciones: {
        create: [
          { nombre: '30ml', precio: 1500.00, stock: 5 },
          { nombre: '60ml', precio: 2200.00, stock: 5 }
        ]
      }
    }
  })

  console.log('✅ Producto test creado con presentaciones:', productoTest.nombre)
  console.log('🎉 Seed completado exitosamente!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })