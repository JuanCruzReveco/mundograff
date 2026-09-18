import React from "react";
import CarouselStacked from "./carousel-07";

export default function ClientesSection() {
  return (
    <section id="clientes" className="py-24 bg-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* REGLA 4: Encabezado de sección centrado */}
        <div className="text-center mb-12 reveal-on-scroll">
          <p className="text-[10px] tracking-widest text-[#008E7A] uppercase font-bold mb-4">
            Alianzas Estratégicas
          </p>
          <h2 className="bg-gradient-to-br from-[#FF5A00] to-[#FFA200] text-transparent bg-clip-text drop-shadow-[0_2px_15px_rgba(255,90,0,0.4)] text-4xl md:text-5xl font-heading font-extrabold">
            Confían en Nosotros
          </h2>
        </div>

        {/* Carrusel Interactivo de Logos */}
        <div className="w-full reveal-on-scroll">
          <CarouselStacked />
        </div>

      </div>
    </section>
  );
}
