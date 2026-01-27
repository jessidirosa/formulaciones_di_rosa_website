import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, apellido, email, password } = await req.json()

    // Validación básica ampliada
    if (!name || !apellido || !email || !password) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios (Nombre, Apellido, Email y Contraseña)." },
        { status: 400 }
      )
    }

    // ¿Ya existe ese mail?
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      )
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario con los nuevos campos del schema
    await prisma.user.create({
      data: {
        nombre: name,     // Mapeamos name del form a nombre en DB
        apellido: apellido,
        email: email.toLowerCase(),
        passwordHash,
        role: "USER",
      },
    })

    return NextResponse.json(
      {
        ok: true,
        message: "Usuario creado correctamente.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Error en /api/auth/register:", error)
    return NextResponse.json(
      { error: "Error interno al crear el usuario." },
      { status: 500 }
    )
  }
}