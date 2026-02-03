"use client";

import React, { useState } from 'react';
import { toast } from "sonner"; // ✅ Importación agregada

const Contacto: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '', // ✅ Nuevo campo agregado
        tipo: 'Formulación Personalizada',
        mensaje: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const res = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus('success');
                toast.success("¡Consulta enviada con éxito!");
            } else {
                throw new Error();
            }
        } catch (error) {
            setStatus('idle');
            toast.error("Hubo un problema al enviar. Por favor, reintentá.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#3A4031] font-sans text-left">
            {/* Header Sección */}
            <section className="bg-[#4A5D45] py-20 px-6 text-center text-[#F5F5F0]">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Contacto Directo</h1>
                <p className="text-lg opacity-90 max-w-2xl mx-auto italic">
                    Estamos aquí para asesorarte sobre nuestras formulaciones personalizadas.
                </p>
            </section>

            <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">

                {/* Info de Contacto */}
                <div className="space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 border-b-2 border-[#A3B18A] pb-2 inline-block uppercase tracking-tighter">
                            Nuestro Laboratorio
                        </h2>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="bg-[#4A5D45] p-3 rounded-full text-white">⏰</div>
                            <div>
                                <h4 className="font-bold">Horarios de Atención</h4>
                                <p className="text-[#5B6350]">Lunes a Viernes: 08:00 - 15:00 hs</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#E9E9E0] p-8 rounded-3xl border border-[#D6D6C2] shadow-sm">
                        <h3 className="text-xl font-bold mb-4 italic">¿Necesitás una respuesta rápida?</h3>
                        <div className="flex flex-col gap-4">
                            <a
                                href="https://wa.me/541137024467"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] text-white py-4 rounded-2xl font-bold shadow-md hover:scale-[1.02] transition-all text-center flex items-center justify-center gap-2"
                            >
                                WhatsApp Profesional
                            </a>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-[#E9E9E0]">
                    {status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-in fade-in duration-500">
                            <div className="text-6xl mb-4">🌿</div>
                            <h3 className="text-2xl font-bold text-[#4A5D45]">¡Mensaje Recibido!</h3>
                            <p className="mt-2 text-slate-500">Un miembro de nuestro equipo se pondrá en contacto pronto.</p>
                            <button onClick={() => setStatus('idle')} className="mt-6 text-sm underline text-[#A3B18A] font-bold uppercase tracking-widest">Enviar otro mensaje</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-[#A3B18A]">Nombre Completo</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none transition-all"
                                    placeholder="Ej: Ana García"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-[#A3B18A]">Correo Electrónico</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none transition-all"
                                        placeholder="ana@ejemplo.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-[#A3B18A]">Teléfono / WhatsApp</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none transition-all"
                                        placeholder="Ej: 11 1234 5678"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-[#A3B18A]">Tipo de Consulta</label>
                                <select
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none font-medium"
                                >
                                    <option>Formulación Personalizada</option>
                                    <option>Consulta de Stock (Tienda)</option>
                                    <option>Tratamientos Médicos</option>
                                    <option>Cosmética/Capilar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-[#A3B18A]">Tu mensaje</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.mensaje}
                                    onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-[#F9F9F7] border border-[#E9E9E0] focus:ring-2 focus:ring-[#A3B18A] outline-none transition-all"
                                    placeholder="Contanos cómo podemos ayudarte..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-[#4A5D45] text-white py-4 rounded-2xl font-bold hover:bg-[#3D4C39] transition-all disabled:opacity-50 uppercase text-[10px] tracking-[0.2em]"
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