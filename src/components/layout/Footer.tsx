'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [logoError, setLogoError] = useState(false)

  // URL directa de Cloudinary
  const logoSrc = !logoError
    ? 'https://res.cloudinary.com/dj71ufqjc/image/upload/v1770505920/logo_nuevo_2_r8nwl7.png'
    : 'https://placehold.co/200x60/4A5D45/F5F5F0?text=DI+ROSA'

  return (
    <footer className="bg-[#1A1C18] text-[#F5F5F0]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">

          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="inline-block transition-all hover:opacity-80">
              <div className="h-14 w-auto flex items-center">
                <img
                  src={logoSrc}
                  alt="Formulaciones Di Rosa"
                  className={`h-full w-auto object-contain ${!logoError ? 'brightness-0 invert' : ''}`}
                  onError={() => setLogoError(true)}
                />
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Más de 20 años de experiencia en <strong>formulaciones magistrales</strong>.
              Ciencia y naturaleza combinadas para ofrecerte soluciones personalizadas,
              cruelty free y accesibles.
            </p>
            {/* Redes Sociales */}
            <div className="flex space-x-5">
              <a href="https://wa.me/541137024467" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#25D366] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>
              </a>
              <a href="https://www.instagram.com/formulacionesdirosa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.353 2.62 6.777 6.98 6.977 1.28.057 1.688.072 4.948.072s3.667-.015 4.947-.072c4.351-.2 6.777-2.62 6.977-6.977.058-1.28.072-1.688.072-4.947s-.015-3.667-.072-4.947c-.2-4.353-2.62-6.78-6.977-6.979C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-4">
            <h3 className="text-[#A3B18A] font-bold text-sm uppercase tracking-widest">Navegación</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/tienda" className="hover:text-white transition-colors">Tienda Online</Link></li>
              <li><Link href="/sobre-nosotros" className="hover:text-white transition-colors">Nuestra Historia</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Información legal */}
          <div className="space-y-4">
            <h3 className="text-[#A3B18A] font-bold text-sm uppercase tracking-widest">Información</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/politicas/envios" className="hover:text-white transition-colors">Política de envíos</Link></li>
              <li><Link href="/politicas/terminos-condiciones" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
            </ul>
          </div>
        </div>

        {/* Separador y copyright */}
        <div className="border-t border-[#3A4031] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-left">
            © {currentYear} Formulaciones Di Rosa. Todos los derechos reservados.
          </p>
          <p className="text-[#A3B18A] text-[10px] font-bold uppercase tracking-widest">
            Cosmética Magistral • Natural • Cruelty Free
          </p>
        </div>
      </div>
    </footer>
  )
}