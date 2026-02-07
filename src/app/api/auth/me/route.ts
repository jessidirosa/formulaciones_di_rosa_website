import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

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

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { nombre, apellido, email, telefono, currentPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // 1. Validación de Email
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser) {
        return NextResponse.json({ error: "El email ya está en uso" }, { status: 400 })
      }
    }

    // 2. Lógica de Contraseña mejorada (Solo actúa si hay texto real)
    let passwordUpdate = {}

    // Solo intentamos actualizar si AMBOS campos tienen contenido y no son solo espacios
    if (currentPassword?.trim() || newPassword?.trim()) {

      if (!currentPassword?.trim() || !newPassword?.trim()) {
        return NextResponse.json({
          error: "Para cambiar la contraseña, debés completar ambos campos (actual y nueva)."
        }, { status: 400 })
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isMatch) {
        return NextResponse.json({ error: "La contraseña actual es incorrecta." }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres." }, { status: 400 })
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12)
      passwordUpdate = { passwordHash: newPasswordHash }
    }

    // 3. Update usando el ID
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
      message: "Perfil actualizado correctamente",
      user: {
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        email: updatedUser.email,
        telefono: updatedUser.telefono
      }
    })

  } catch (error) {
    console.error("❌ Error en PATCH /api/auth/me:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}