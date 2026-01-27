import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET: Obtener datos completos del usuario logueado
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

// PATCH: Actualizar datos (Apellido, Teléfono, etc)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { nombre, apellido, telefono } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        nombre,
        apellido,
        telefono
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