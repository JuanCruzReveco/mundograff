import React, { useState, useEffect } from "react";
import CarouselStacked from "./carousel-07";

export default function ClientesSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section id="clientes" className="pt-24 pb-48 bg-white dark:bg-black overflow-x-hidden overflow-y-visible relative transition-colors duration-300">
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

        {/* Carrusel Interactivo de Logos protegido contra SSR mismatch */}
        <div className="relative w-full reveal-on-scroll min-h-[400px] flex items-center justify-center">
          {/* Luz NEÓN centrada ESTRICTAMENTE detrás de las tarjetas (Visible en ambos temas) */}
          {/* Core brillante del Neón (Optimizado sin blur CSS) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] max-w-sm h-[80px] bg-[radial-gradient(ellipse_at_center,_rgba(0,229,255,0.6)_0%,_transparent_70%)] pointer-events-none rounded-full" />
          {/* Resplandor extendido de Xenón (Optimizado sin blur CSS) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-3xl h-[200px] bg-[radial-gradient(ellipse_at_center,_rgba(0,142,122,0.3)_0%,_transparent_70%)] pointer-events-none rounded-full" />
          
          {mounted ? <CarouselStacked /> : null}
        </div>

      </div>
    </section>
  );
}
