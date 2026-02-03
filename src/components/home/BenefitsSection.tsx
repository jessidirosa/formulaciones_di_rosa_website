import { CreditCard, Landmark, Truck, ShieldCheck } from 'lucide-react'

const benefits = [
    {
        title: "Cuotas sin interés",
        desc: "3 cuotas con todas las tarjetas",
        icon: <CreditCard className="w-6 h-6 text-[#4A5D45]" />
    },
    {
        title: "10% Descuento",
        desc: "Pagando vía transferencia",
        icon: <Landmark className="w-6 h-6 text-[#4A5D45]" />
    },
    {
        title: "Envíos Seguros",
        desc: "A domicilio o sucursal",
        icon: <Truck className="w-6 h-6 text-[#4A5D45]" />
    },
    {
        title: "Calidad Magistral",
        desc: "Fórmulas certificadas",
        icon: <ShieldCheck className="w-6 h-6 text-[#4A5D45]" />
    }
]

export default function BenefitsSection() {
    return (
        <div className="bg-[#F9F9F7] py-12 border-y border-[#E9E9E0]">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((b, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-3 group">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#E9E9E0] group-hover:scale-110 transition-transform">
                                {b.icon}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#3A4031]">{b.title}</h4>
                                <p className="text-[11px] text-gray-500 mt-1 italic">{b.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}