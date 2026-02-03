import { PrismaClient, TipoCupon } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({ // ✅ Cambiado a .user
    where: { email: 'admin@formulacionesdirosa.com' },
    update: {},
    create: {
      email: 'admin@formulacionesdirosa.com',
      passwordHash: adminPassword, // ✅ Campo correcto: passwordHash
      nombre: 'Administrador',
      apellido: 'Sistema',
      telefono: '+541122334455',
      role: 'ADMIN' // ✅ Campo correcto: role
    }
  })
  console.log('✅ Usuario admin creado:', admin.email)

  // 2. Crear usuario de prueba
  const userPassword = await bcrypt.hash('usuario123', 12)
  const testUser = await prisma.user.upsert({ // ✅ Cambiado a .user
    where: { email: 'cliente@ejemplo.com' },
    update: {},
    create: {
      email: 'cliente@ejemplo.com',
      passwordHash: userPassword, // ✅ Campo correcto: passwordHash
      nombre: 'María',
      apellido: 'González',
      telefono: '+541134567890',
      role: 'USER'
    }
  })
  console.log('✅ Usuario test creado:', testUser.email)

  // 3. Crear productos de ejemplo
  // Nota: Eliminé campos que no existen en tu modelo Producto (beneficios, modoUso, tiposPiel)
  // para evitar errores de compilación.
  const productosData = [
    {
      nombre: 'Crema Antiage con Retinol Natural',
      slug: 'crema-antiage-retinol-natural',
      descripcionCorta: 'Crema con retinol natural que estimula la renovación celular',
      descripcionLarga: 'Crema facial antiage formulada con retinol de origen natural que estimula la renovación celular, reduce las líneas de expresión y mejora la textura de la piel.',
      categoria: 'Antiage',
      precio: 12500,
      imagen: 'https://placehold.co/500x500?text=Crema+Antiage+Retinol+Natural',
      destacado: true,
      stock: 25
    },
    {
      nombre: 'Serum Antimanchas con Vitamina C',
      slug: 'serum-antimanchas-vitamina-c',
      descripcionCorta: 'Serum concentrado que unifica el tono y reduce manchas',
      descripcionLarga: 'Serum facial con alta concentración de vitamina C estabilizada que ayuda a unificar el tono de la piel, reduce las manchas y aporta luminosidad.',
      categoria: 'Manchas',
      precio: 9800,
      imagen: 'https://placehold.co/500x500?text=Serum+Vitamina+C+Antimanchas',
      destacado: true,
      stock: 30
    }
  ]

  for (const p of productosData) {
    await prisma.producto.upsert({
      where: { slug: p.slug },
      update: {},
      create: p
    })
  }
  console.log('✅ Productos creados')

  // 4. Crear cupones de ejemplo
  const cupon = await prisma.cupon.upsert({
    where: { codigo: 'BIENVENIDO10' },
    update: {},
    create: {
      codigo: 'BIENVENIDO10',
      descripcion: 'Descuento de bienvenida del 10%',
      tipo: TipoCupon.PORCENTAJE, // ✅ Uso del Enum correcto
      valor: 10,
      montoMinimo: 5000,
      fechaVencimiento: new Date('2025-12-31'),
      activo: true,
      limiteUsos: 100
    }
  })
  console.log('✅ Cupón creado:', cupon.codigo)

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