"use client"

import { LocationMap } from "./expand-map"

export default function UbicacionSection() {
  return (
    <section id="ubicacion" className="relative py-32 bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      {/* Fondo degradado responsivo: Blanco a Teal en Light Mode / Negro a Carmesí en Dark Mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#008E7A]/10 to-white dark:from-black dark:via-[#9E002B]/30 dark:to-black pointer-events-none transition-colors duration-300" />
      
      {/* Luz central radial responsiva: Resplandor Teal (color frío de la paleta) en Light Mode / Resplandor Naranja en Dark Mode */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,142,122,0.25)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(255,90,0,0.15)_0%,_transparent_60%)] pointer-events-none transition-colors duration-300" />
      
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
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-[#0C1C47] dark:text-white leading-[1.1] drop-shadow-2xl">
            Nuestra Planta Industrial
          </h2>

          {/* Subtítulo invitación */}
          <p className="mt-5 font-sans text-neutral-600 dark:text-neutral-400 text-lg md:text-xl leading-relaxed">
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
