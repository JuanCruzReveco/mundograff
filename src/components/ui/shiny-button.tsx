"use client"

import React, { useRef, useState, useEffect } from "react"

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  href?: string
  style?: React.CSSProperties
}

export function ShinyButton({ children, onClick, className = "", href, style }: ShinyButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    buttonRef.current.style.setProperty("--x", `${x}px`)
    buttonRef.current.style.setProperty("--y", `${y}px`)
  }

  const content = (
    <>
      <div className="shiny-cta-spotlight" />
      <span>{children}</span>
    </>
  )

  return (
    <>
      {/* Se removió el atributo 'jsx' para evitar warnings en Astro/React18, el CSS en línea funciona perfecto */}
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,500&display=swap");

        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-angle-offset {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-percent {
          syntax: "<percentage>";
          initial-value: 5%;
          inherits: false;
        }

        @property --gradient-shine {
          syntax: "<color>";
          initial-value: white;
          inherits: false;
        }

        .shiny-cta {
          /* Fondo blanco original, ganando contraste a través de los contornos */
          --shiny-cta-bg: #ffffff;
          --shiny-cta-bg-subtle: #000000; /* Borde interno negro duro para máximo contraste */
          --shiny-cta-fg: #000000;
          /* REGLA 1: Tonos verdes característicos de WhatsApp */
          --shiny-cta-highlight: #128C7E; /* Verde más oscuro/fuerte para el modo claro */
          --shiny-cta-highlight-subtle: #25D366;
          --animation: gradient-angle linear infinite;
          --duration: 3s;
          --shadow-size: 2px;
          --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
          
          isolation: isolate;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          outline-offset: 4px;
          padding: 1.25rem 2.5rem;
          font-family: "Inter", sans-serif;
          font-size: 1.125rem;
          line-height: 1.2;
          font-weight: 700;
          border: 4px solid transparent; /* Contorno animado mucho más grueso */
          border-radius: 360px;
          color: var(--shiny-cta-fg);
          background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
            conic-gradient(
              from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
              transparent,
              var(--shiny-cta-highlight) var(--gradient-percent),
              var(--gradient-shine) calc(var(--gradient-percent) * 2),
              var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
              transparent calc(var(--gradient-percent) * 4)
            ) border-box;
          /* Sombra interna negra muy marcada, más la sombra verde exterior */
          box-shadow: inset 0 0 0 2px var(--shiny-cta-bg-subtle), 0 12px 40px rgba(37, 211, 102, 0.4);
          transition: var(--transition);
          transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine;
          
          /* Añadido flexbox para alinear el SVG y el texto perfectamente */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .dark .shiny-cta {
          --shiny-cta-bg: #000000;
          --shiny-cta-bg-subtle: #1a1818;
          --shiny-cta-fg: #ffffff;
          font-weight: 500;
          border-width: 1px;
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle);
        }

        /* Cursor tracking spotlight */
        .shiny-cta-spotlight {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            120px circle at var(--x, 50%) var(--y, 50%),
            rgba(37, 211, 102, 0.4),
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }
        
        .dark .shiny-cta-spotlight {
          background: radial-gradient(
            120px circle at var(--x, 50%) var(--y, 50%),
            rgba(37, 211, 102, 0.6),
            transparent 100%
          );
        }

        .shiny-cta:hover .shiny-cta-spotlight {
          opacity: 1;
        }

        .shiny-cta::before,
        .shiny-cta::after,
        .shiny-cta span::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset-inline-start: 50%;
          inset-block-start: 50%;
          translate: -50% -50%;
          z-index: -1;
        }

        .shiny-cta:active {
          translate: 0 1px;
        }

        /* Dots pattern */
        .shiny-cta::before {
          --size: calc(100% - var(--shadow-size) * 3);
          --position: 2px;
          --space: calc(var(--position) * 2);
          width: var(--size);
          height: var(--size);
          background: radial-gradient(
            circle at var(--position) var(--position),
            white calc(var(--position) / 4),
            transparent 0
          ) padding-box;
          background-size: var(--space) var(--space);
          background-repeat: space;
          mask-image: conic-gradient(
            from calc(var(--gradient-angle) + 45deg),
            black,
            transparent 10% 90%,
            black
          );
          border-radius: inherit;
          opacity: 0.4;
          z-index: -1;
        }

        /* Inner shimmer */
        .shiny-cta::after {
          --animation: shimmer linear infinite;
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(
            -50deg,
            transparent,
            var(--shiny-cta-highlight),
            transparent
          );
          mask-image: radial-gradient(circle at bottom, transparent 40%, black);
          opacity: 0.6;
        }

        .shiny-cta span {
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .shiny-cta span::before {
          --size: calc(100% + 1rem);
          width: var(--size);
          height: var(--size);
          box-shadow: inset 0 -1ex 2rem 4px var(--shiny-cta-highlight);
          opacity: 0;
          transition: opacity var(--transition);
          animation: calc(var(--duration) * 1.5) breathe linear infinite;
        }

        /* Animate */
        .shiny-cta,
        .shiny-cta::before,
        .shiny-cta::after {
          animation: var(--animation) var(--duration),
            var(--animation) calc(var(--duration) / 0.4) reverse paused;
          animation-composition: add;
        }

        .shiny-cta:is(:hover, :focus-visible) {
          --gradient-percent: 20%;
          --gradient-angle-offset: 95deg;
          --gradient-shine: var(--shiny-cta-highlight-subtle);
        }

        .shiny-cta:is(:hover, :focus-visible),
        .shiny-cta:is(:hover, :focus-visible)::before,
        .shiny-cta:is(:hover, :focus-visible)::after {
          animation-play-state: running;
        }

        .shiny-cta:is(:hover, :focus-visible) span::before {
          opacity: 1;
        }

        @keyframes gradient-angle {
          to {
            --gradient-angle: 360deg;
          }
        }

        @keyframes shimmer {
          to {
            rotate: 360deg;
          }
        }

        @keyframes breathe {
          from, to {
            scale: 1;
          }
          50% {
            scale: 1.2;
          }
        }
      `}</style>

      {/* REGLA 2: Implementación de Enlace (<a>) si hay href */}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`shiny-cta ${className}`} onClick={onClick} style={style} ref={buttonRef as any} onMouseMove={handleMouseMove}>
          {content}
        </a>
      ) : (
        <button className={`shiny-cta ${className}`} onClick={onClick} style={style} ref={buttonRef as any} onMouseMove={handleMouseMove}>
          {content}
        </button>
      )}
    </>
  )
}
