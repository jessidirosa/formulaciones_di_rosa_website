import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/CartContext"
import { UserProvider } from "@/contexts/UserContext"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ToastProvider } from "@/components/ui/toaster" // 👈 nuevo import

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Formulaciones Di Rosa - Cosmética Magistral & Natural",
  description:
    "Preparaciones cosméticas magistrales y naturales. Productos personalizados para el cuidado de tu piel. Cruelty free. Envíos a todo el país.",
  keywords: [
    "cosmética magistral",
    "cosmética natural",
    "cruelty free",
    "cuidado de la piel",
    "productos naturales",
  ],
  openGraph: {
    title: "Formulaciones Di Rosa - Cosmética Magistral & Natural",
    description:
      "Preparaciones cosméticas magistrales y naturales. Productos personalizados para el cuidado de tu piel.",
    url: "https://formulacionesdirosa.com",
    siteName: "Formulaciones Di Rosa",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formulaciones Di Rosa - Cosmética Magistral & Natural",
    description:
      "Preparaciones cosméticas magistrales y naturales. Productos personalizados para el cuidado de tu piel.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <ToastProvider>
          <UserProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
