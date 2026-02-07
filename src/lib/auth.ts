// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // ✅ Agregamos el secret explícitamente para producción
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/mi-cuenta/login",   // 👈 ACA
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const ok = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!ok) return null

        // ✅ Verificamos si es admin comparando con la variable de entorno o por el rol en DB
        const isAdminEmail = user.email === process.env.ADMIN_EMAIL
        const hasAdminRole = user.role === "ADMIN"

        return {
          id: user.id.toString(),
          name: user.nombre || "",
          email: user.email,
          apellido: user.apellido || "",
          telefono: user.telefono || "",
          role: (isAdminEmail || hasAdminRole) ? "ADMIN" : "USER",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // @ts-ignore
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id
        // @ts-ignore
        session.user.role = token.role
      }
      return session
    },
  },
}

export default authOptions