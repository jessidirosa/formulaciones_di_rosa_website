import { ShieldCheck, CreditCard, RotateCcw, Info } from 'lucide-react'

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F0] py-16 px-4">
            <div className="container mx-auto max-w-4xl text-left">
                <h1 className="text-4xl font-serif font-bold text-[#3A4031] mb-8 border-l-4 border-[#4A5D45] pl-6">
                    Términos y Condiciones
                </h1>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#E9E9E0] space-y-10">

                    <section>
                        <h2 className="text-lg font-bold text-[#4A5D45] mb-4 flex items-center gap-2 uppercase tracking-tight">
                            <ShieldCheck className="w-5 h-5" /> Calidad y Aval Profesional
                        </h2>
                        <p className="text-sm text-[#5B6350] leading-relaxed">
                            Laboratorio Di Rosa cuenta con más de 20 años de experiencia en farmacia magistral. Al ser preparaciones a medida, cada formulación cuenta con el aval y la supervisión del farmacéutico responsable, garantizando la seguridad y eficacia según las normativas de farmacia magistral.
                            <br /><br />
                            <strong>Durabilidad:</strong> Al ser productos magistrales y naturales, tienen una vida útil estimada de <strong>6 meses a un año</strong> desde su elaboración.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-[#4A5D45] mb-4 flex items-center gap-2 uppercase tracking-tight">
                            <CreditCard className="w-5 h-5" /> Métodos de Pago y Descuentos
                        </h2>
                        <p className="text-sm text-[#5B6350] mb-4">Aceptamos efectivo, transferencia bancaria y Mercado Pago.</p>
                        <div className="bg-[#F9F9F7] p-5 rounded-2xl border border-[#E9E9E0]">
                            <p className="text-xs font-bold text-[#A3B18A] uppercase mb-2">Beneficios por Volumen</p>
                            <ul className="text-xs text-[#5B6350] space-y-1">
                                <li>• Descuentos especiales para profesionales de la salud y estética.</li>
                                <li>• Descuento mayorista a partir de 20 unidades del mismo producto (superando compra total de $400.000).</li>
                                <li>• Precios diferenciales por volumen (envases de 250g/ml en adelante).</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-red-50/30 p-8 rounded-3xl border border-red-100">
                        <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
                            <RotateCcw className="w-5 h-5" /> Política de Devoluciones
                        </h2>
                        <p className="text-sm text-red-900/80 leading-relaxed italic">
                            Nuestra prioridad es tu satisfacción y el cuidado de tu piel.
                        </p>
                        <p className="text-sm text-red-900/80 mt-4 leading-relaxed">
                            Dada la naturaleza personalizada y magistral de nuestros productos, las devoluciones se realizan <strong>únicamente</strong> si el producto llega dañado o presenta algún inconveniente de calidad de origen.
                            <br /><br />
                            Para que podamos ayudarte, el reclamo debe realizarse dentro de los <strong>2 meses posteriores a la recepción de la compra</strong>. Estamos siempre dispuestos a escucharte y resolver cualquier inconveniente que surja con tu pedido.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-start gap-3 p-4 bg-[#E9E9E0]/50 rounded-2xl">
                            <Info className="w-5 h-5 text-[#4A5D45] mt-0.5" />
                            <p className="text-[11px] text-[#5B6350]">
                                Laboratorio Di Rosa se reserva el derecho de modificar estos términos para adaptarse a nuevas normativas o mejoras en el servicio. La realización de una compra implica la aceptación de estas condiciones.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}