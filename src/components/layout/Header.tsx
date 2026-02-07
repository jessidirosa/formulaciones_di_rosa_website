'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from "@/contexts/CartContext"
import { useUser } from "@/contexts/UserContext"
import { Button } from "@/components/ui/button"
import AnnouncementBanner from "@/components/ui/AnnouncementBanner"
import { ShoppingCart, User, Menu, X, LogOut, Settings } from "lucide-react"

export default function Header() {
  const { state } = useCart()
  const { user, logout, isAuthenticated } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  // URL optimizada sin timestamp de versión para evitar errores de carga
  const logoSrc = !logoError
    ? 'https://res.cloudinary.com/dj71ufqjc/image/upload/v1770506232/logo_nuevo_2_-_Editado_fkfjnm.png'
    : 'https://placehold.co/200x60/4A5D45/F5F5F0?text=DI+ROSA'

  return (
    <header className="w-full z-50">
      <AnnouncementBanner />

      <nav className="bg-white/80 backdrop-blur-md border-b border-[#E9E9E0] py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">

          {/* Logo con lógica de error */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-12 w-auto flex items-center">
              <img
                src={logoSrc}
                alt="Laboratorio Di Rosa"
                className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                onError={() => setLogoError(true)}
              />
            </div>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/tienda" className="text-[10px] uppercase font-bold tracking-widest text-[#3A4031] hover:text-[#A3B18A] transition-colors">Tienda</Link>
            <Link href="/sobre-nosotros" className="text-[10px] uppercase font-bold tracking-widest text-[#3A4031] hover:text-[#A3B18A] transition-colors">Nosotros</Link>
            <Link href="/contacto" className="text-[10px] uppercase font-bold tracking-widest text-[#3A4031] hover:text-[#A3B18A] transition-colors">Contacto</Link>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-[#4A5D45]">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="relative text-[#4A5D45]">
                <ShoppingCart className="h-5 w-5" />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#A3B18A] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {state.items.length}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/mi-cuenta">
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-[#4A5D45] font-bold text-[10px] uppercase tracking-tighter">
                    <User className="h-4 w-4" /> {user?.nombre || 'Mi Cuenta'}
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="text-red-400">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/mi-cuenta/login">
                <Button variant="ghost" size="icon" className="text-[#4A5D45]">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="md:hidden ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Menú Móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E9E9E0] p-6 space-y-4 animate-in slide-in-from-top duration-300 text-left">
          <Link href="/tienda" className="block text-xs font-bold uppercase tracking-widest text-[#3A4031]" onClick={() => setIsMenuOpen(false)}>Tienda</Link>
          <Link href="/sobre-nosotros" className="block text-xs font-bold uppercase tracking-widest text-[#3A4031]" onClick={() => setIsMenuOpen(false)}>Nosotros</Link>
          <Link href="/contacto" className="block text-xs font-bold uppercase tracking-widest text-[#3A4031]" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
          {isAuthenticated && (
            <Link href="/mi-cuenta" className="block text-xs font-bold uppercase tracking-widest text-[#4A5D45]" onClick={() => setIsMenuOpen(false)}>Mi Perfil</Link>
          )}
        </div>
      )}
    </header>
  )
}