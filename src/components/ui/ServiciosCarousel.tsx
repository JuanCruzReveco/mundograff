"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// Asegurate de que la ruta a utils coincida con tu proyecto Astro
import { cn } from "../../lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(148px, 25vw, 300px)", // Ligeramente más grande para más impacto
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = "Cover carousel",
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides[selected];

  return (
    <div
      className={cn("w-full", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-10 outline-none ring-0 focus-visible:ring-0 active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: "var(--cf-card)",
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                className={cn(
                  "absolute left-1/2 top-0 aspect-square overflow-hidden rounded-2xl bg-black shadow-[0_0_50px_rgba(0,0,0,1)] will-change-transform border-0",
                  cardClassName,
                )}
                style={{ width: "var(--cf-card)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className="h-full w-full select-none object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => nudge(-1)}
              // REGLA 1: Botones oscuros, iconos blancos, hover Naranja Fuego
              className="absolute left-4 md:left-12 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition-all duration-300 hover:bg-[#FF5A00] hover:scale-110"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nudge(1)}
              // REGLA 1: Botones oscuros, iconos blancos, hover Naranja Fuego
              className="absolute right-4 md:right-12 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition-all duration-300 hover:bg-[#FF5A00] hover:scale-110"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div
          key={selected}
          className="mt-6 flex flex-col items-center px-6 duration-300 animate-in fade-in zoom-in-95 text-center"
        >
          {/* REGLA 2: Título blanco brillante, font-heading, 2xl extrabold */}
          <p className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white drop-shadow-md">
            {active.title}
          </p>
          {active.subtitle && (
            // REGLA 2: Subtítulo con resplandor y gradiente volumétrico Naranja Fuego
            <p className="mt-2 text-sm md:text-base font-semibold uppercase tracking-widest bg-gradient-to-br from-[#FF5A00] to-[#FFA200] text-transparent bg-clip-text drop-shadow-[0_2px_15px_rgba(255,90,0,0.4)]">
              {active.subtitle}
            </p>
          )}
          {active.meta && active.meta.length > 0 && (
            <dl className="mt-8 w-full max-w-[320px] text-[14px]">
              {active.meta.map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-neutral-900 last:border-0">
                  {/* REGLA 3: dt Gris Mate, dd Blanco */}
                  <dt className="text-neutral-400 font-sans tracking-wide">{row.label}</dt>
                  <dd className="font-medium text-white font-sans">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              // REGLA 1: Puntos de paginación Naranja Fuego al estar activos
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                index === selected ? "bg-[#FF5A00] w-8 shadow-[0_0_10px_rgba(255,90,0,0.5)]" : "bg-white/20 w-2.5 hover:bg-white/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// DEMO REFACTORIZADO Y DATOS REALES DE MUNDOGRAFF
// ----------------------------------------------------------------------------

// REGLA 1 y 2: RUTAS LOCALES y MAPEO DE LOS 8 SERVICIOS
const SERVICIOS_SLIDES = [
  {
    src: "/vinilos foto.jpg",
    alt: "Impresión Gran Formato MundoGraff",
    title: "Impresión Gran Formato",
    subtitle: "Lonas y Vinilos",
    meta: [
      { label: "Calidad", value: "Alta Resolución" },
      { label: "Aplicación", value: "Interior y Exterior" },
    ],
  },
  {
    src: "/stickers.jpg",
    alt: "Stickers Personalizados MundoGraff",
    title: "Stickers Personalizados",
    subtitle: "Corte a Medida",
    meta: [
      { label: "Formato", value: "Planchas" },
      { label: "Material", value: "Vinilo Resistente" },
    ],
  },
  {
    src: "/stickers2.jpg",
    alt: "Stickers Especiales MundoGraff",
    title: "Stickers Especiales",
    subtitle: "Holográficos y Texturas",
    meta: [
      { label: "Acabado", value: "Premium" },
      { label: "Corte", value: "Troquelado exacto" },
    ],
  },
  {
    src: "/tarjetas.jpg",
    alt: "Tarjetas Corporativas MundoGraff",
    title: "Tarjetas Corporativas",
    subtitle: "Identidad Profesional",
    meta: [
      { label: "Impresión", value: "Offset / Digital" },
      { label: "Gramaje", value: "Alto" },
    ],
  },
  {
    src: "/tarjetasrelieve.jpg",
    alt: "Tarjetas Premium MundoGraff",
    title: "Tarjetas Premium",
    subtitle: "Terminaciones Especiales",
    meta: [
      { label: "Detalles", value: "Hot Stamping / Relieve" },
      { label: "Diseño", value: "Exclusivo" },
    ],
  },
  {
    src: "/revista.jpg",
    alt: "Revistas y Catálogos MundoGraff",
    title: "Revistas y Catálogos",
    subtitle: "Papelería Comercial",
    meta: [
      { label: "Tiradas", value: "Cortas y Largas" },
      { label: "Encuadernación", value: "Múltiples opciones" },
    ],
  },
  {
    src: "/señales seguridad.jpg",
    alt: "Cartelería Industrial MundoGraff",
    title: "Cartelería Industrial",
    subtitle: "Señalización de Seguridad",
    meta: [
      { label: "Normativas", value: "Reglamentarias" },
      { label: "Material", value: "Alto Impacto / PVC" },
    ],
  },
  {
    src: "/señales.jpg",
    alt: "Señalización Vial MundoGraff",
    title: "Señalización Vial",
    subtitle: "Cartelería Exterior",
    meta: [
      { label: "Durabilidad", value: "Extrema" },
      { label: "Visibilidad", value: "Alta reflectividad" },
    ],
  },
];

export default function ServiciosCarousel() {
  return (
    <div className="w-full overflow-hidden bg-transparent py-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl mx-auto">
        <CoverflowCarousel 
          slides={SERVICIOS_SLIDES} 
          showCaption={true} 
          showNavigation={true}
          showPagination={true}
        />
      </div>
    </div>
  );
}
