import { PrismaClient, TipoCupon } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'formulacionesdr@gmail.com' },
    update: {
      passwordHash: adminPassword, // ✅ Ahora sí actualiza la clave si ya existe
      telefono: '+5491137024467',  // 👈 PONÉ ACÁ EL TELÉFONO CORRECTO
      nombre: 'Administrador',
      role: 'ADMIN'
    },
    create: {
      email: 'formulacionesdr@gmail.com',
      passwordHash: adminPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      telefono: '+5491137024467', // 👈 PONÉ ACÁ EL TELÉFONO CORRECTO
      role: 'ADMIN'
    }
  })
  console.log('✅ Usuario admin actualizado/creado:', admin.email)
  console.log('🎉 Seed completado exitosamente!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })