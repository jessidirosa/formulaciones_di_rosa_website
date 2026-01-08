import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  // Si no hay sesión válida, devolvemos user: null
  if (!session?.user?.email) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ user: null }, { status: 404 })
  }

  // 🔴 IMPORTANTE: acá armamos exactamente lo que esperan
  // Header, MiCuenta y el resto del frontend
  return NextResponse.json({
    user: {
      id: user.id,
      nombre: user.name ?? "",
      // estos dos los casteo porque pueden no existir en tu modelo
      apellido: (user as any).apellido ?? "",
      email: user.email,
      telefono: (user as any).telefono ?? "",
      role: user.role,
      esAdmin: user.role === "ADMIN",
      creadoEn: user.createdAt.toISOString(),
    },
  })
}
