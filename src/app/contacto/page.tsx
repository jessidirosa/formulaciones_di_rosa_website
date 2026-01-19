"use client";

import React, { useState } from 'react';

const Contacto: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        // Simulación de envío
        setTimeout(() => setStatus('success'), 1500);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#3A4031] font-sans"> {/* Fondo Beige claro */}

            {/* Header Sección */}
            <section className="bg-[#4A5D45] py-20 px-6 text-center text-[#F5F5F0]"> {/* Verde Musgo */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Contacto Directo</h1>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                    Estamos aquí para asesorarte sobre nuestras formulaciones personalizadas y productos exclusivos.
                </p>
            </section>

            <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">

                {/* Lado Izquierdo: Información de Contacto */}
                <div className="space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 border-b-2 border-[#A3B18A] pb-2 inline-block">
                            Nuestro Laboratorio
                        </h2>
                        <div className="space-y-6 mt-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#4A5D45] p-3 rounded-full text-white text-xl">
                                    <span className="block w-6 h-6 flex items-center justify-center">📍</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Dirección Física</h4>
                                    <p className="text-[#5B6350]">Calle Ejemplo 1234, Ciudad, País</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-[#4A5D45] p-3 rounded-full text-white">
                                    <span className="block w-6 h-6 flex items-center justify-center">⏰</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Horarios de Atención</h4>
                                    <p className="text-[#5B6350]">Lunes a Viernes: 09:00 - 18:00 hs</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción Directa */}
                    <div className="bg-[#E9E9E0] p-8 rounded-2xl border border-[#D6D6C2]">
                        <h3 className="text-xl font-bold mb-4 italic">¿Necesitas una respuesta rápida?</h3>
                        <div className="flex flex-col gap-4">
                            <a
                                href="https://wa.me/tu-numero-aqui?text=Hola!%20Deseo%20consultar%20por%20una%20formulacion%20personalizada"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] text-white py-4 rounded-xl font-bold shadow-md hover:bg-[#1EBE57] transition-all text-center flex items-center justify-center gap-2"
                            >
                                WhatsApp Profesional
                            </a>
                            <a
                                href="/tienda"
                                className="bg-[#4A5D45] text-white py-4 rounded-xl font-bold shadow-md hover:bg-[#3D4C39] transition-all text-center"
                            >
                                Ver Catálogo Online
                            </a>
                        </div>
                    </div>
                </div>

                {/* Lado Derecho: Formulario */}
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-[#E9E9E0]">
                    {status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                            <div className="text-5xl mb-4">🌿</div>
                            <h3 className="text-2xl font-bold text-[#4A5D45]">¡Mensaje Recibido!</h3>
                            <p className="mt-2 text-slate-500">Un farmacéutico se pondrá en contacto contigo a la brevedad.</p>
                            <button onClick={() => setStatus('idle')} className="mt-6 text-sm underline">Enviar otro mensaje</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Nombre Completo</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-4 rounded-lg bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none transition-all"
                                    placeholder="Ej: Ana García"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Correo Electrónico</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full p-4 rounded-lg bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none transition-all"
                                    placeholder="ana@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Tipo de Consulta</label>
                                <select className="w-full p-4 rounded-lg bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none">
                                    <option>Formulación Personalizada</option>
                                    <option>Consulta de Stock (Tienda)</option>
                                    <option>Tratamientos Médicos</option>
                                    <option>Cosmética/Capilar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Tu mensaje</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full p-4 rounded-lg bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none transition-all"
                                    placeholder="Cuéntanos cómo podemos ayudarte..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-[#4A5D45] text-white py-4 rounded-lg font-bold hover:bg-[#3D4C39] transition-colors disabled:opacity-50"
                            >
                                {status === 'sending' ? 'Enviando...' : 'Enviar Consulta'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contacto;