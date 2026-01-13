'use client';

import React, { useState } from 'react';

const ContactoPage = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        mensaje: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Formulario enviado. Nos pondremos en contacto contigo pronto.');
        setFormData({ nombre: '', email: '', mensaje: '' });
    };

    return (
        <div>
            <h1>Contacto</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="mensaje">Mensaje:</label>
                    <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Enviar</button>
            </form>
            <div>
                <a
                    href="https://wa.me/1234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Contactar por WhatsApp
                </a>
            </div>
        </div>
    );
};

export default ContactoPage;
