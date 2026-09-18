"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─── 12 capas alternando entre CÁLIDAS y OSCURAS-CÁLIDAS ───
// No hay negro puro: las capas oscuras son marrón/burdeo profundo.
// Al expandirse ambas, el fondo "respira" entre claro y oscuro sin cortes.
const LAYER_COUNT = 12;
const CYCLE_DURATION = 20; // lento y armónico

const LAYERS = Array.from({ length: LAYER_COUNT }, (_, i) => ({
  delay: (i / LAYER_COUNT) * CYCLE_DURATION,
  parallax: 10 + i * 6,
  // Alternamos: par = cálido vibrante, impar = oscuro cálido
  isWarm: i % 2 === 0,
}));

// Degradés cálidos vibrantes (carmesí → naranja)
const WARM_GRADIENTS = [
  "radial-gradient(ellipse at center, rgba(255,90,0,0.75) 0%, rgba(158,0,43,0.6) 45%, rgba(80,5,18,0.15) 80%, transparent 100%)",
  "radial-gradient(ellipse at center, rgba(158,0,43,0.7) 0%, rgba(255,90,0,0.5) 40%, rgba(100,10,20,0.15) 80%, transparent 100%)",
  "radial-gradient(ellipse at center, rgba(255,120,40,0.65) 0%, rgba(200,20,30,0.5) 45%, rgba(80,5,15,0.1) 80%, transparent 100%)",
];

// Degradés oscuros cálidos (marrón/burdeo, NO negro puro)
const DARK_GRADIENTS = [
  "radial-gradient(ellipse at center, rgba(30,8,12,0.85) 0%, rgba(60,12,20,0.5) 40%, rgba(40,8,14,0.15) 80%, transparent 100%)",
  "radial-gradient(ellipse at center, rgba(40,10,16,0.8) 0%, rgba(50,10,18,0.45) 45%, rgba(35,6,12,0.1) 80%, transparent 100%)",
  "radial-gradient(ellipse at center, rgba(25,6,10,0.85) 0%, rgba(55,12,20,0.5) 40%, rgba(30,5,10,0.15) 80%, transparent 100%)",
];

function TunnelLayer({
  layer,
  index,
  mouseX,
  mouseY,
}: {
  layer: (typeof LAYERS)[number];
  index: number;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  const x = useTransform(mouseX, (v) => v * layer.parallax);
  const y = useTransform(mouseY, (v) => v * layer.parallax);

  const gradients = layer.isWarm ? WARM_GRADIENTS : DARK_GRADIENTS;
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ x, y }}
    >
      <div
        className="tunnel-ring"
        style={{
          width: "65vw",
          height: "70vh",
          marginLeft: "-32.5vw",
          marginTop: "-35vh",
          background: gradient,
          filter: "blur(35px)",
          borderRadius: "50%",
          animationDelay: `-${layer.delay}s`,
        }}
      />
    </motion.div>
  );
}

export default function AnimatedFooter() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 80, damping: 20, mass: 0.8 });
  const mouseY = useSpring(rawMouseY, { stiffness: 80, damping: 20, mass: 0.8 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawMouseX.set(nx);
    rawMouseY.set(ny);
  };

  const handleMouseLeave = () => {
    rawMouseX.set(0);
    rawMouseY.set(0);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const isHome = document.getElementById('inicio') !== null || document.getElementById('servicios') !== null;

    if (isHome) {
      const element = document.querySelector(targetId.replace('/', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (targetId.includes('#inicio')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.history.pushState(null, '', targetId.replace('/', ''));
    } else {
      let currentPath = window.location.pathname;
      let homeUrl = '/';
      
      if (currentPath.includes('/privacidad')) {
        homeUrl = currentPath.split('/privacidad')[0] + '/';
      }
      
      window.location.href = homeUrl + targetId.replace('/', '');
    }
  };

  return (
    <footer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden min-h-[50vh] flex flex-col justify-between cursor-default"
      style={{ backgroundColor: "#050B1A" }}
    >
      {/* CSS Keyframes */}
      <style>{`
        @keyframes tunnel-expand {
          0% {
            transform: scale(0.12);
            opacity: 0;
          }
          6% {
            opacity: 0.9;
          }
          70% {
            opacity: 0.7;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        .tunnel-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          animation: tunnel-expand ${CYCLE_DURATION}s linear infinite;
          will-change: transform, opacity;
        }
      `}</style>

      {/* ═══════ TÚNEL: Capas cálidas + oscuras alternándose ═══════ */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Resplandor ambiental cálido de fondo */}
        <div
          className="absolute"
          style={{
            width: "120%",
            height: "120%",
            background: "radial-gradient(ellipse at center, rgba(158,0,43,0.15) 0%, rgba(26,6,10,1) 65%)",
          }}
        />

        {/* Las 12 capas expandiéndose */}
        {LAYERS.map((layer, i) => (
          <TunnelLayer key={i} layer={layer} index={i} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>

      {/* ═══════ CONTENIDO CORPORATIVO (REDISEÑO) ═══════ */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-10 pointer-events-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Columna Izquierda: Marca y CTA (Ocupa 5 espacios) */}
          <div className="md:col-span-5 flex flex-col items-start">
            <a href="/#inicio" onClick={(e) => handleNavClick(e, '/#inicio')} className="block">
              <img 
                src="/temaoscuro/logo_horizontal-removebg-preview.png" 
                alt="MundoGraff" 
                className="h-10 w-auto mb-6 object-contain hover:opacity-90 transition-opacity" 
              />
            </a>
            <p className="text-neutral-400 font-sans text-sm max-w-sm mb-8 leading-relaxed">
              Producción gráfica integral. El respaldo de oficio que tu marca necesita.
            </p>
            <a 
              href="https://wa.me/542615109808?text=Hola%20MundoGraff,%20quisiera%20pedir%20un%20presupuesto"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#9E002B] to-[#FF5A00] text-white font-heading font-bold text-sm px-6 py-3 rounded-full hover:scale-105 transition-transform inline-flex items-center w-max shadow-[0_0_20px_rgba(255,90,0,0.3)] hover:shadow-[0_0_25px_rgba(255,90,0,0.5)]"
            >
              Pedir un presupuesto
            </a>
          </div>

          {/* Columnas Derechas: Enlaces (Ocupa 7 espacios) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
            
            {/* Columna 1: SERVICIOS */}
            <div>
              <h3 className="text-xs font-heading tracking-widest text-neutral-500 uppercase mb-6">
                Servicios
              </h3>
              <ul className="flex flex-col gap-4">
                {[
                  { label: "Inicio", href: "/#inicio" },
                  { label: "Cartelería e Impresiones", href: "/#servicios" },
                  { label: "Sobre Nosotros", href: "/#nosotros" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} onClick={(e) => handleNavClick(e, item.href)} className="text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 2: CONTACTO */}
            <div>
              <h3 className="text-xs font-heading tracking-widest text-neutral-500 uppercase mb-6">
                Contacto
              </h3>
              <ul className="flex flex-col gap-4">
                <li>
                  <a href="mailto:mundograff@hotmail.com" className="text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors">
                    mundograff@hotmail.com
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/542615109808" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors">
                    +54 9 261 510-9808
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=1606520581&locale=es_LA" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/mundograff_impresiones/" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 3: LEGAL */}
            <div>
              <h3 className="text-xs font-heading tracking-widest text-neutral-500 uppercase mb-6">
                Legal
              </h3>
              <ul className="flex flex-col gap-4">
                {[
                  { label: "Política de privacidad", href: "/privacidad" },
                  { label: "Uso de cookies", href: "/privacidad#cookies" },
                  { label: "Términos y condiciones", href: "/privacidad#terminos" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} onClick={(e) => handleNavClick(e, item.href)} className="text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Cierre: Copyright */}
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-xs text-neutral-500 font-sans text-center">
            © 2026 MundoGraff. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
