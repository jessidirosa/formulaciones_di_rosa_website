import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Forzamos el secreto aquí también por si el import de lib/auth falla en leer el env
const handler = NextAuth({
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }