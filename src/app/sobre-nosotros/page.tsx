"use client";

import React from 'react';
import Link from 'next/link';

const SobreNosotros: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#3A4031] font-sans">

            {/* Hero Section con paleta Musgo */}
            <header className="relative bg-[#4A5D45] py-24 px-6 text-center text-[#F5F5F0]">
                <div className="max-w-4xl mx-auto">
                    <span className="text-[#A3B18A] font-semibold tracking-[0.2em] uppercase text-sm italic">
                        Desde hace más de dos décadas
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mt-6 mb-8 leading-tight">
                        Nuestra Historia & <br /> Compromiso Magistral
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 leading-relaxed font-light">
                        Nacimos con la visión de transformar el cuidado personal en una experiencia más
                        <strong> viable, natural y accesible</strong>, creando soluciones a medida para cada paciente.
                    </p>
                </div>
            </header>

            {/* Stats en tonos Beige y Oliva */}
            <section className="py-16 bg-[#E9E9E0] border-y border-[#D6D6C2]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-2">
                            <div className="text-5xl font-serif text-[#4A5D45]">+20</div>
                            <p className="text-[#6B705C] uppercase text-xs font-bold tracking-widest">Años de experiencia</p>
                        </div>
                        <div className="space-y-2 border-y md:border-y-0 md:border-x border-[#D6D6C2] py-8 md:py-0">
                            <div className="text-5xl font-serif text-[#4A5D45]">+200</div>
                            <p className="text-[#6B705C] uppercase text-xs font-bold tracking-widest">Fórmulas Propias</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-5xl font-serif text-[#4A5D45]">100%</div>
                            <p className="text-[#6B705C] uppercase text-xs font-bold tracking-widest">Cruelty Free</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección Detallada con Imágenes */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-[#A3B18A] opacity-20 rounded-2xl group-hover:opacity-30 transition-opacity"></div>
                        <img
                            src="https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=800"
                            alt="Laboratorio Artesanal"
                            className="relative rounded-xl shadow-2xl z-10 grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                        />
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#4A5D45]">
                            Formulaciones exclusivas con alma natural
                        </h2>
                        <p className="text-lg leading-relaxed text-[#5B6350]">
                            Especializados en cosmética, salud capilar y tratamientos médicos,
                            nos diferenciamos por la personalización absoluta. Entendemos que no hay dos
                            pieles iguales ni dos necesidades idénticas.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Ingredientes de origen botánico y pureza farmacéutica.",
                                "Transparencia total: etiquetas entendibles para todos.",
                                "Compromiso ético con el bienestar animal.",
                                "Atención profesional directa y sin intermediarios."
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-[#3A4031]">
                                    <span className="text-[#A3B18A] text-xl">✔</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-[#4A5D45] py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h3 className="text-3xl font-bold text-[#F5F5F0]">¿Quieres conocer nuestro catálogo?</h3>
                    <p className="text-[#A3B18A] text-lg">
                        Explora más de 200 productos diseñados para tu bienestar integral.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-5">
                        <Link
                            href="/tienda"
                            className="bg-[#F5F5F0] text-[#4A5D45] px-12 py-4 rounded-full font-bold hover:bg-[#E9E9E0] transition-all shadow-lg"
                        >
                            Visitar Tienda
                        </Link>
                        <a
                            href="https://wa.me/+5491137024467"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#A3B18A] text-[#F5F5F0] px-12 py-4 rounded-full font-bold hover:bg-[#8FA173] transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default SobreNosotros;