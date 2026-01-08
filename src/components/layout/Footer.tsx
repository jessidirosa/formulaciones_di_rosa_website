import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <img
                src="/logo.png"
                alt="Formulaciones Di Rosa"
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Cosmética magistral y natural. Preparaciones personalizadas para el cuidado de tu piel.
              Cruelty free con envíos a todo el país.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/541137024467"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-400 transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/formulacionesdirosa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.5 13.559 3.5 12.017c0-1.542.698-2.878 1.626-3.674.875-.807 2.026-1.297 3.323-1.297 1.542 0 2.878.49 3.674 1.297.807.796 1.297 2.132 1.297 3.674 0 1.542-.49 2.878-1.297 3.674-.796.807-2.132 1.297-3.674 1.297zm7.83-9.041c-.49 0-.875-.384-.875-.875 0-.49.384-.875.875-.875.49 0 .875.384.875.875 0 .49-.384.875-.875.875zm-3.674 5.553c-1.542 0-2.795-1.253-2.795-2.795 0-1.542 1.253-2.795 2.795-2.795 1.542 0 2.795 1.253 2.795 2.795 0 1.542-1.253 2.795-2.795 2.795z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="text-gray-300 hover:text-white transition-colors">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-gray-300 hover:text-white transition-colors">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Información legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Información</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/politicas/envios" className="text-gray-300 hover:text-white transition-colors">
                  Política de envíos
                </Link>
              </li>
              <li>
                <Link href="/politicas/info" className="text-gray-300 hover:text-white transition-colors">
                  Información importante
                </Link>
              </li>
              <li>
                <Link href="/politicas/terminos-condiciones" className="text-gray-300 hover:text-white transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/politicas/privacidad" className="text-gray-300 hover:text-white transition-colors">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador y copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} Formulaciones Di Rosa. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Cosmética magistral y natural • Cruelty free • Envíos a todo el país
          </p>
        </div>
      </div>
    </footer>
  )
}