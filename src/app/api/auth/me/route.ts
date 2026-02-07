import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET: Obtener datos completos
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        role: true,
      }
    })
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 })
  }
}

// PATCH: Actualizar datos (incluyendo Email) y/o Contraseña
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { nombre, apellido, email, telefono, currentPassword, newPassword } = await req.json()

    // Buscamos al usuario actual una sola vez para validaciones
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // 1. Si intenta cambiar el email, verificamos que no esté en uso por OTRO
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser) {
        return NextResponse.json({ error: "El email ya está registrado por otro usuario" }, { status: 400 })
      }
    }

    // 2. Lógica para cambio de contraseña
    let passwordUpdate = {}
    if (currentPassword || newPassword) {
      // Si envió uno pero no el otro
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Debes ingresar la contraseña actual y la nueva" }, { status: 400 })
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isMatch) {
        return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12)
      passwordUpdate = { passwordHash: newPasswordHash }
    }

    // 3. Actualización final en la base de datos
    // Usamos el ID del usuario (que es inmutable) en lugar del email para evitar errores si el email cambia
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        nombre: nombre || user.nombre,
        apellido: apellido || user.apellido,
        email: email || user.email,
        telefono: telefono || user.telefono,
        ...passwordUpdate
      }
    })

    return NextResponse.json({
      ok: true,
      message: "Perfil actualizado con éxito",
      user: {
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        email: updatedUser.email,
        telefono: updatedUser.telefono
      }
    })
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error)
    return NextResponse.json({ error: "Error interno al actualizar los datos" }, { status: 500 })
  }
}