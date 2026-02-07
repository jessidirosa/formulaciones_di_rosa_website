import { Truck, Clock, MapPin, PackageCheck } from 'lucide-react'

export default function EnviosPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F0] py-16 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl font-serif font-bold text-[#3A4031] mb-8 border-l-4 border-[#4A5D45] pl-6">
                    Políticas de Envío y Entrega
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E9E9E0]">
                        <Clock className="w-8 h-8 text-[#A3B18A] mb-4" />
                        <h3 className="font-bold text-[#3A4031] uppercase text-xs tracking-widest mb-2">Tiempos de Preparación</h3>
                        <p className="text-sm text-[#5B6350] leading-relaxed">
                            Al ser un laboratorio de preparación magistral, cada producto se elabora con dedicación. El tiempo estimado de producción es de <strong>10 a 15 días hábiles</strong>, dependiendo de la complejidad de la fórmula y el stock de activos.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E9E9E0]">
                        <Truck className="w-8 h-8 text-[#A3B18A] mb-4" />
                        <h3 className="font-bold text-[#3A4031] uppercase text-xs tracking-widest mb-2">Métodos de Envío</h3>
                        <p className="text-sm text-[#5B6350] leading-relaxed">
                            Realizamos envíos a todo el país mediante <strong>Correo Argentino y Andreani</strong> (demora estimada de 3-4 días hábiles post-despacho) o <strong>Motomensajería</strong> para CABA y GBA (entrega en el día coordinado).
                        </p>
                    </div>
                </div>

                <div className="space-y-8 text-left bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#E9E9E0]">
                    <section>
                        <h2 className="text-lg font-bold text-[#4A5D45] mb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Retiros en Persona
                        </h2>
                        <p className="text-sm text-[#5B6350]">
                            Podés retirar tu pedido sin cargo en nuestras oficinas ubicadas en el <strong>Centro de Caseros, Prov. de Buenos Aires</strong>. Una vez que tu pedido esté listo, nos pondremos en contacto con vos para coordinar el día y horario de retiro.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-[#4A5D45] mb-3 flex items-center gap-2">
                            <PackageCheck className="w-5 h-5" /> Condiciones de Despacho
                        </h2>
                        <ul className="list-disc pl-5 text-sm text-[#5B6350] space-y-2">
                            <li><strong>Envíos por Correo:</strong> El costo debe ser abonado junto con el pedido previo al despacho.</li>
                            <li><strong>Motomensajería:</strong> Trabajamos con una empresa externa. El valor es aproximado y puede abonarse al recibir (solo el envío). El valor de los productos debe estar pago en su totalidad previamente.</li>
                            <li>Todos los envíos se realizan una vez que el pago de la mercadería ha sido acreditado.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}