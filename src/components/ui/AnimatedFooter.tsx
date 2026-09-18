"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─── 12 capas alternando entre CÁLIDAS y OSCURAS-CÁLIDAS ───
// No hay negro puro: las capas oscuras son marrón/burdeo profundo.
// Al expandirse ambas, el fondo "respira" entre claro y oscuro sin cortes.
const LAYER_COUNT = 6; // Reducido para evitar overdraw masivo en GPUs integradas
const CYCLE_DURATION = 20;

const LAYERS = Array.from({ length: LAYER_COUNT }, (_, i) => ({
  delay: (i / LAYER_COUNT) * CYCLE_DURATION,
  parallax: 15 + i * 8, // Aumenté el factor parallax para compensar la menor cantidad de capas
  isWarm: i % 2 === 0,
}));

// Degradés simulando Gaussian Blur puro (curva exponencial de opacidad)
const WARM_GRADIENTS = [
  "radial-gradient(ellipse at center, rgba(255,90,0,0.5) 0%, rgba(158,0,43,0.25) 30%, rgba(80,5,18,0.08) 60%, rgba(40,2,8,0.02) 85%, transparent 100%)",
  "radial-gradient(ellipse at center, rgba(158,0,43,0.45) 0%, rgba(255,90,0,0.2) 30%, rgba(100,10,20,0.08) 60%, rgba(50,5,10,0.02) 85%, transparent 100%)",
];

const DARK_GRADIENTS = [
  "radial-gradient(ellipse at center, rgba(30,8,12,0.6) 0%, rgba(60,12,20,0.25) 35%, rgba(40,8,14,0.08) 65%, rgba(20,4,7,0.02) 85%, transparent 100%)",
  "radial-gradient(ellipse at center, rgba(40,10,16,0.55) 0%, rgba(50,10,18,0.2) 35%, rgba(35,6,12,0.08) 65%, rgba(15,3,5,0.02) 85%, transparent 100%)",
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
      style={{ x, y, willChange: "transform" }}
    >
      <div
        className="tunnel-ring-scaler"
        style={{
          animationDelay: `-${layer.delay}s`,
        }}
      >
        <div
          style={{
            width: "65vw",
            height: "70vh",
            marginLeft: "-32.5vw",
            marginTop: "-35vh",
            background: gradient,
            // Cero filtros: todo el suavizado lo hace el radial-gradient
            borderRadius: "50%",
            transform: "translateZ(0)", 
          }}
        />
      </div>
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
    // Calculamos el ratio directamente usando el viewport.
    // Esto evita llamar a getBoundingClientRect() en cada frame de mouse,
    // lo cual causaba "Layout Thrashing" (cuello de botella en el procesador) y tirones al scrollear.
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    rawMouseX.set(nx);
    rawMouseY.set(ny);
  };

  const handleMouseLeave = () => {
    rawMouseX.set(0);
    rawMouseY.set(0);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    const isAnchorToHome = targetId.startsWith('/#');
    const isAnchorToPrivacy = targetId.startsWith('/privacidad#');
    
    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/mundograff/') || document.getElementById('inicio') !== null;
    const isCurrentlyPrivacy = currentPath.includes('/privacidad');

    if (isAnchorToHome) {
      e.preventDefault();
      const anchor = targetId.replace('/', '');
      if (isHome) {
        const element = document.querySelector(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (anchor === '#inicio') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.history.pushState(null, '', anchor);
      } else {
        let homeUrl = '/';
        if (isCurrentlyPrivacy) {
          homeUrl = currentPath.split('/privacidad')[0] + '/';
        }
        window.location.href = homeUrl + anchor;
      }
    } else if (isAnchorToPrivacy) {
      if (isCurrentlyPrivacy) {
        e.preventDefault();
        const anchor = targetId.replace('/privacidad', '');
        const element = document.querySelector(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        window.history.pushState(null, '', anchor);
      }
      // Si no estamos en privacidad, dejamos que el enlace funcione normalmente y cargue la página
    } else {
      // Enlaces normales (/privacidad, mailto:, etc). Dejamos que el navegador maneje la navegación.
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
        /* El SCALER se encarga únicamente de animar la escala y opacidad */
        .tunnel-ring-scaler {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Columna Izquierda: Marca y CTA (Ocupa 4 espacios) */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-8">
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

          {/* Columnas Derechas: Enlaces (Ocupa 8 espacios) */}
          <div className="lg:col-span-8 flex flex-col md:flex-row justify-between gap-12 md:gap-8">
            
            {/* Columna 1: NAVEGACIÓN */}
            <div>
              <h3 className="text-xs font-heading tracking-widest text-neutral-500 uppercase mb-6">
                Navegación
              </h3>
              <ul className="flex flex-col gap-4">
                <li>
                  <a href="/#inicio" onClick={(e) => handleNavClick(e, '/#inicio')} className="flex items-center gap-3 text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="/#servicios" onClick={(e) => handleNavClick(e, '/#servicios')} className="flex items-center gap-3 text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                      <line x1="3" x2="21" y1="9" y2="9"/>
                      <line x1="9" x2="9" y1="21" y2="9"/>
                    </svg>
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="/#trayectoria" onClick={(e) => handleNavClick(e, '/#trayectoria')} className="flex items-center gap-3 text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    </svg>
                    Trayectoria
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 2: CONTACTO */}
            <div>
              <h3 className="text-xs font-heading tracking-widest text-neutral-500 uppercase mb-6">
                Contacto
              </h3>
              <ul className="flex flex-col gap-4">
                <li>
                  <a href="mailto:mundograff@hotmail.com" className="flex items-center gap-3 text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    mundograff@hotmail.com
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/542615109808" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=1606520581&locale=es_LA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                    MundoGraff
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/mundograff_impresiones/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-neutral-300 font-sans hover:text-[#FF5A00] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                    @mundograff_impresiones
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
