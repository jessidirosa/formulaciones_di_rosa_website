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

  // cantidad total de items (sumando cantidades)
  const totalItems = state.items.reduce(
    (acc: number, item: any) => acc + item.cantidad,
    0
  )

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const isActive = (href: string) =>
    pathname === href ? "text-emerald-700 font-semibold" : "text-gray-700"

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-28 flex items-center justify-center text-xs">
            <img src={logo.src} alt="Formulaciones Di Rosa" className="h-15 w-auto" />
          </div>
        </Link>

        {/* Navegación */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className={isActive("/")}>
            Inicio
          </Link>
          <Link href="/tienda" className={isActive("/tienda")}>
            Tienda
          </Link>
          <Link href="/sobre-nosotros" className={isActive("/sobre-nosotros")}>
            Sobre nosotros
          </Link>
          <Link href="/contacto" className={isActive("/contacto")}>
            Contacto
          </Link>
        </nav>

        {/* Acciones derecha */}
        <div className="flex items-center gap-3">
          {/* Carrito con contador */}
          <Link href="/carrito" aria-label="Carrito">
            <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border">
              <span>🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] px-1 rounded-full bg-emerald-500 text-white text-[11px] leading-[18px] text-center">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>

          {/* Estado de usuario */}
          {isLoading ? (
            <div className="h-9 w-32 bg-gray-100 rounded animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link href="/mi-cuenta">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Hola, {user.nombre ?? "Mi cuenta"}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/mi-cuenta/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-800"
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/mi-cuenta/registro">
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Crear cuenta
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
