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

  return (
    <footer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden min-h-[95vh] flex flex-col justify-between cursor-default"
      // Fondo oscuro CÁLIDO (no negro puro)
      style={{ backgroundColor: "#1a060a" }}
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

      {/* ═══════ CONTENIDO ═══════ */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start w-full max-w-7xl mx-auto px-10 pt-14 pointer-events-auto">
        <h3 className="max-w-md font-heading font-extrabold text-2xl md:text-3xl text-white leading-snug tracking-tight drop-shadow-lg">
          Producción gráfica integral.{" "}
          <span className="text-slate-400 font-semibold">
            El respaldo de oficio que tu marca necesita.
          </span>
        </h3>

        <nav className="flex flex-col items-start md:items-end gap-2 mt-8 md:mt-0">
          {[
            { label: "Inicio", href: "#inicio" },
            { label: "Servicios", href: "#servicios" },
            { label: "Contacto", href: "#contacto" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-white font-sans font-semibold text-base hover:text-[#FF5A00] transition-colors duration-300"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* ═══════ BOTTOM ═══════ */}
      <div className="relative z-10 w-full px-10 pb-10 max-w-7xl mx-auto flex flex-col gap-6 pointer-events-auto">
        
        {/* Fila inferior: Botón + Copyright izquierda | Logo derecha */}
        <div className="flex items-end justify-between w-full">
          <div className="flex flex-col items-start gap-4">
            {/* Botón Pedir Presupuesto con aura naranja */}
            <a
              href="https://wa.me/542615109808?text=Hola%20MundoGraff,%20quisiera%20pedir%20un%20presupuesto"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-black/80 border border-[#FF5A00]/30 text-white font-sans font-semibold text-base overflow-hidden transition-all duration-500 hover:border-[#FF5A00]/70 hover:shadow-[0_0_25px_rgba(255,90,0,0.3)]"
            >
              {/* Aura naranja animada */}
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: "inset 0 0 30px 5px rgba(255,90,0,0.15)" }} />
              {/* Brillo rotativo naranja en el borde */}
              <span className="absolute inset-[-1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin" style={{ background: "conic-gradient(from 0deg, transparent, #FF5A00, transparent, transparent)", animationDuration: "3s", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", WebkitMaskComposite: "xor", padding: "1.5px" }} />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF5A00] relative z-10">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              <span className="relative z-10">Pedir Presupuesto</span>
            </a>

            {/* Copyright */}
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-sans">
              © 2026 MUNDOGRAFF
            </p>
          </div>

          {/* Logo más grande a la derecha */}
          <a href="#inicio" className="hover:opacity-90 transition-opacity">
            <img
              src="/temaoscuro/logo_horizontal-removebg-preview.png"
              alt="MundoGraff"
              className="h-20 md:h-28 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
