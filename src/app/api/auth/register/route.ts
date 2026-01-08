// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validación básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios." },
        { status: 400 }
      )
    }

    // ¿Ya existe ese mail?
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      )
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER", // por defecto usuario común
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
