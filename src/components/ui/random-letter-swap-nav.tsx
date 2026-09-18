"use client";

import { useState, useEffect, useRef } from "react";
import { RandomLetterSwap } from "./random-letter-swap";

// Array de objetos en español con anclas funcionales
const links = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Trayectoria", href: "/#trayectoria" },
];

export default function RandomLetterSwapNav() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Siempre visible si está arriba del todo
        if (currentY < 80) {
          setVisible(true);
        } else if (currentY > lastScrollY.current) {
          // Scrolleando hacia abajo → esconder
          setVisible(false);
        } else {
          // Scrolleando hacia arriba → mostrar
          setVisible(true);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <nav
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl flex items-center justify-between bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-4 md:px-6 py-2.5 shadow-2xl shadow-black/70 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-28 opacity-0 pointer-events-none"
      }`}
    >
      {/* Izquierda: Logotipo Horizontal de Marca */}
      <a href="/#inicio" onClick={(e) => handleNavClick(e, '/#inicio')} className="flex items-center hover:opacity-90 transition-opacity">
        <img
          src="/temaoscuro/logo_horizontal-removebg-preview.png"
          alt="MundoGraff"
          className="h-7 md:h-8 w-auto object-contain"
        />
      </a>

      {/* Centro: Links de Navegación con animación de letras */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="no-underline"
          >
            <RandomLetterSwap
              className="cursor-pointer font-sans font-semibold text-sm text-neutral-300 hover:text-[#FF5A00] transition-colors duration-300"
              label={link.label}
              staggerDuration={0.04}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
            />
          </a>
        ))}
      </div>

      {/* Derecha: Botón CTA destacado estilo píldora */}
      <a
        href="https://wa.me/542615109808?text=Hola%20MundoGraff,%20quisiera%20pedir%20un%20presupuesto"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#FF5A00] hover:bg-[#FFA200] text-black font-heading font-extrabold text-xs md:text-sm px-4 md:px-5 py-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(255,90,0,0.4)] hover:shadow-[0_0_20px_rgba(255,162,0,0.6)] hover:scale-105"
      >
        <span>Contacto</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-[#000000]">
          <path d="M7 17L17 7"/>
          <path d="M7 7h10v10"/>
        </svg>
      </a>
    </nav>
  );
}
