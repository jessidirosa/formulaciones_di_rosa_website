import React from 'react';

const SobreNosotros = () => {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#2E3D2F', padding: '20px', backgroundColor: '#F4F5F3' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#3A5A40' }}>Sobre Nosotros</h1>
                <p style={{ fontSize: '18px', color: '#556B2F' }}>
                    Laboratorio Magistral - Innovación y Profesionalismo
                </p>
            </header>
            <section>
                <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    En nuestro laboratorio magistral, nos dedicamos a ofrecer soluciones personalizadas y de alta calidad para
                    satisfacer las necesidades específicas de cada cliente. Somos una empresa moderna y profesional, comprometida
                    con la excelencia en cada uno de nuestros procesos.
                </p>
                <p style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '20px' }}>
                    Nuestro equipo de expertos trabaja con dedicación y precisión, utilizando tecnología de vanguardia y
                    respetando los más altos estándares de calidad. Nos enorgullece ser un referente en el sector, brindando
                    confianza y resultados excepcionales.
                </p>
                <p style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '20px' }}>
                    La naturaleza y la innovación son nuestra inspiración, por eso nuestra identidad visual se basa en tonos de
                    verdes musgo, reflejando nuestro compromiso con la sostenibilidad y el cuidado del medio ambiente.
                </p>
            </section>
        </div>
    );
};

export default SobreNosotros;