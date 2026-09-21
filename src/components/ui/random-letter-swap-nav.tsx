"use client";

import { useState, useEffect, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import { RandomLetterSwap } from "./random-letter-swap";

// Array de objetos en español con anclas funcionales
const links = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Trayectoria", href: "/#trayectoria" },
];

export default function RandomLetterSwapNav() {
  const [visible, setVisible] = useState(true);
  const [theme, setTheme] = useState("dark");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // Initial theme check
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
    
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Siempre visible si está arriba del todo
        if (currentY < 80) {
          setVisible(true);
        } else if (currentY > lastScrollY.current) {
          // Scrolleando hacia abajo â†’ esconder
          setVisible(false);
        } else {
          // Scrolleando hacia arriba â†’ mostrar
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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Sincronizar tanto Tailwind (class="dark") como Variables CSS (data-theme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl flex items-center justify-between bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full px-4 md:px-6 py-2.5 shadow-2xl shadow-black/10 dark:shadow-black/70 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-28 opacity-0 pointer-events-none"
      }`}
    >
      {/* Izquierda: Logotipo Horizontal de Marca */}
      <a href="/#inicio" onClick={(e) => handleNavClick(e, '/#inicio')} className="flex items-center hover:opacity-90 transition-opacity">
        <img
          src={theme === "light" ? "/logo-horizontal.png" : "/temaoscuro/logo_horizontal-removebg-preview.png"}
          alt="MundoGraff"
          className="h-10 md:h-12 w-auto object-contain transition-all duration-300"
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
              className="cursor-pointer font-sans font-semibold text-sm text-neutral-700 dark:text-neutral-300 hover:text-[#FF5A00] dark:hover:text-[#FF5A00] transition-colors duration-300"
              label={link.label}
              staggerDuration={0.04}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
            />
          </a>
        ))}
      </div>

      {/* Derecha: Toggle de tema y Botón CTA destacado estilo píldora */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Toggle Theme Switch */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center gap-[8px] w-[66px] h-[34px] p-1 rounded-full bg-white dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 transition-colors duration-300 focus:outline-none"
          aria-label="Toggle Dark Mode"
        >
          {/* Sliding background circle */}
          <div
            className={`absolute left-1 top-1 w-[24px] h-[24px] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              theme === "light" 
                ? "translate-x-[32px] bg-[#E2E8F0]" // Slate 200 / Gray 200
                : "translate-x-0 bg-[#333333]"      // Dark gray
            }`}
          />

          {/* Moon Icon (Left) */}
          <div className="relative z-10 flex items-center justify-center shrink-0 w-[24px] h-[24px] pointer-events-none">
            <Moon 
              className={`w-[14px] h-[14px] transition-colors duration-300 ${
                theme === "light" ? "text-neutral-800" : "text-white"
              }`} 
              strokeWidth={2} 
            />
          </div>
          
          {/* Sun Icon (Right) */}
          <div className="relative z-10 flex items-center justify-center shrink-0 w-[24px] h-[24px] pointer-events-none">
            <Sun 
              className={`w-[14px] h-[14px] transition-colors duration-300 ${
                theme === "light" ? "text-neutral-800" : "text-neutral-500"
              }`} 
              strokeWidth={2} 
            />
          </div>
        </button>

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
      </div>
    </nav>
  );
}
