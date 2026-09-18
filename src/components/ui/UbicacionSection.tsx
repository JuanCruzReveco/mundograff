"use client"

import { LocationMap } from "./expand-map"

export default function UbicacionSection() {
  return (
    <section id="ubicacion" className="relative py-32 bg-black overflow-hidden">
      {/* Fondo degradado Carmesí/Anaranjado fundiéndose con negro (arriba y abajo) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#9E002B]/30 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,90,0,0.15)_0%,_transparent_60%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-16 reveal-on-scroll">

        {/* Columna Izquierda: Textos */}
        <div className="flex flex-col items-start max-w-lg">
          {/* Sobretítulo */}
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FF5A00] shadow-[0_0_8px_#FF5A00] animate-pulse"></span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#FF5A00] font-bold font-sans">
              Dónde Encontrarnos
            </span>
          </div>

          {/* Título */}
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-[1.1] drop-shadow-2xl">
            Nuestra Planta Industrial
          </h2>

          {/* Subtítulo invitación */}
          <p className="mt-5 font-sans text-neutral-400 text-lg md:text-xl leading-relaxed">
            Acercate a conocer nuestro taller y descubrí cómo le damos vida a cada proyecto. Te esperamos con las puertas abiertas.
          </p>
        </div>

        {/* Columna Derecha: Mapa Interactivo */}
        <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
          <LocationMap className="w-full" />
        </div>

      </div>
    </section>
  )
}
