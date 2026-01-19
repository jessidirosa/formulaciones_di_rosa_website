"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import logo from '@/logo.png';

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useUser()
  const { state } = useCart()

  const totalItems = state.items.reduce(
    (acc: number, item: any) => acc + item.cantidad,
    0
  )

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Color Musgo para el link activo
  const isActive = (href: string) =>
    pathname === href ? "text-[#4A5D45] font-bold border-b-2 border-[#4A5D45]" : "text-gray-600 hover:text-[#4A5D45]"

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo con mejor centrado */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <img src={logo.src} alt="Formulaciones Di Rosa" className="h-12 w-auto object-contain" />
        </Link>

        {/* Navegación - Text-xs para un aire más profesional */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] uppercase tracking-widest">
          <Link href="/" className={`${isActive("/")} transition-all pb-1`}>Inicio</Link>
          <Link href="/tienda" className={`${isActive("/tienda")} transition-all pb-1`}>Tienda</Link>
          <Link href="/sobre-nosotros" className={`${isActive("/sobre-nosotros")} transition-all pb-1`}>Nosotros</Link>
          <Link href="/contacto" className={`${isActive("/contacto")} transition-all pb-1`}>Contacto</Link>
        </nav>

        {/* Acciones derecha */}
        <div className="flex items-center gap-4">
          <Link href="/carrito" className="group relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-gray-50 group-hover:bg-[#E9E9E0] transition-colors">
              <span className="text-xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4A5D45] text-[10px] font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>

          {isLoading ? (
            <div className="h-9 w-24 bg-gray-50 rounded-full animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link href="/mi-cuenta">
                <Button variant="ghost" className="text-[#3A4031] font-semibold text-sm">
                  Hola, {user.nombre}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs border-[#D6D6C2] rounded-full">
                Salir
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/mi-cuenta/login">
                <Button variant="ghost" size="sm" className="text-gray-600 text-xs font-bold uppercase tracking-wider">
                  Ingresar
                </Button>
              </Link>
              <Link href="/mi-cuenta/registro">
                <Button size="sm" className="bg-[#4A5D45] hover:bg-[#3D4C39] text-white text-xs font-bold uppercase tracking-wider rounded-full px-5">
                  Registrarme
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}