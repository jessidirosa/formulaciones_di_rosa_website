import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/CartContext"
import { UserProvider } from "@/contexts/UserContext"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ToastProvider } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Formulaciones Di Rosa - Cosmética Magistral & Natural",
  description: "Preparaciones cosméticas magistrales y naturales. Productos personalizados para el cuidado de tu piel. Cruelty free. Envíos a todo el país.",
  icons: {
    icon: 'https://res.cloudinary.com/dj71ufqjc/image/upload/v1770506232/logo_nuevo_2_-_Editado_fkfjnm.png', // Tu link de Cloudinary
    shortcut: 'https://res.cloudinary.com/dj71ufqjc/image/upload/v1770506232/logo_nuevo_2_-_Editado_fkfjnm.png',
    apple: 'https://res.cloudinary.com/dj71ufqjc/image/upload/v1770506232/logo_nuevo_2_-_Editado_fkfjnm.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      {/* bg-[#F5F5F0] es el beige sutil de la marca */}
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#F5F5F0]`}>
        <ToastProvider>
          <UserProvider>
            <CartProvider>
              <Header />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
            </CartProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  )
}