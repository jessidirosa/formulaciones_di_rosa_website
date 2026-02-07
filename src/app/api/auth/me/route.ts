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

// PATCH: Actualizar datos y/o Contraseña
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { nombre, apellido, telefono, currentPassword, newPassword } = await req.json()

    // Lógica para cambio de contraseña si se envían ambos campos
    let passwordUpdate = {}
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      const isMatch = await bcrypt.compare(currentPassword, user!.passwordHash)
      if (!isMatch) {
        return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12)
      passwordUpdate = { passwordHash: newPasswordHash }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        nombre,
        apellido,
        telefono,
        ...passwordUpdate
      }
    })

    return NextResponse.json({
      ok: true,
      message: "Perfil actualizado",
      user: {
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        telefono: updatedUser.telefono
      }
    })
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error)
    return NextResponse.json({ error: "Error al actualizar los datos" }, { status: 500 })
  }
}