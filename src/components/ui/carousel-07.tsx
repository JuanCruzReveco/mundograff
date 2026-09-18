"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "framer-motion";
import { cn } from "../../lib/utils";

interface Slide {
  image: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: "teal" | "crimson" | "orange";
}

const slides: Slide[] = [
  {
    image: "/clientes/logo1.png",
    title: "Cliente Ejemplo",
    description: "Cartelería y señalización industrial.",
    badge: "Cartelería",
    badgeColor: "teal"
  },
  {
    image: "/clientes/logo2.png",
    title: "Agencia Creativa",
    description: "Diseño e impresión de papelería corporativa premium.",
    badge: "Papelería",
    badgeColor: "crimson"
  },
  {
    image: "/clientes/logo3.png",
    title: "Retail Express",
    description: "Plóters de alta resolución para vidrieras y locales.",
    badge: "Plóters",
    badgeColor: "orange"
  },
  {
    image: "/clientes/logo4.png",
    title: "Estudio Arquitectura",
    description: "Letras corpóreas con iluminación LED frontal.",
    badge: "Corpóreos",
    badgeColor: "teal"
  },
  {
    image: "/clientes/logo5.png",
    title: "Logística Sur",
    description: "Gráfica vehicular para flota pesada de distribución.",
    badge: "Vehicular",
    badgeColor: "crimson"
  },
];

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 90,
      yMultiplier: 20,
      rotationMultiplier: 8,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 650,
      sensitivity: 220,
      xMultiplier: 130,
      yMultiplier: 30,
      rotationMultiplier: 10,
      scaleReduction: 0.09,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 250,
    xMultiplier: 170,
    yMultiplier: 40,
    rotationMultiplier: 12,
    scaleReduction: 0.12,
  };
};

export default function CarouselStacked() {
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const [windowWidth, setWindowWidth] = React.useState(0);

  const total = slides.length;

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth],
  );

  const handleDragStart = () => {
    startProgress.current = scrollProgress.get();
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;

    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-3, Math.min(3, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-10 bg-transparent overflow-hidden select-none">
      <div className="relative w-full max-w-7xl h-80 sm:h-112 lg:h-128 flex items-center justify-center">
        {/* Transparent Drag Surface */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={(_, info) => {
            const delta = -info.delta.x / config.sensitivity;
            scrollProgress.set(scrollProgress.get() + delta);
          }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        />

        {slides.map((slide, i) => (
          <Card
            key={i}
            slide={slide}
            index={i}
            total={total}
            progress={scrollProgress}
            config={config}
          />
        ))}
      </div>
    </div>
  );
};

interface CardProps {
  slide: Slide;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
}

const Card = ({ slide, index, total, progress, config }: CardProps) => {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const x = useTransform(offset, (o) => o * config.xMultiplier);
  const rotate = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return o * config.rotationMultiplier;
  });
  const y = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return absO * config.yMultiplier;
  });
  const scale = useTransform(
    offset,
    (o) => 1 - Math.abs(o) * config.scaleReduction,
  );
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.5, 0, total / 2 - 0.5, total / 2],
    [0, 1, 1, 1, 0],
  );
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10),
  );

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "teal":
        return "bg-[#008E7A]/20 text-[#008E7A] border-[#008E7A]/30 border";
      case "crimson":
        return "bg-[#9E002B]/20 text-[#FF5A00] border-[#9E002B]/30 border"; // Naranja Fuego en texto
      case "orange":
        return "bg-[#FF5A00]/20 text-[#FFA200] border-[#FF5A00]/30 border";
      default:
        return "bg-neutral-800 text-white border-neutral-700 border";
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        y,
        scale,
        opacity,
        zIndex,
      }}
      className={cn(
        "absolute rounded-2xl overflow-hidden group pointer-events-none",
        "w-56 h-72 sm:w-64 sm:h-80 lg:w-72 lg:h-96",
        "bg-[#0A0A0A] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" // REGLA 1: Gris ultra oscuro cristal
      )}
    >
      {/* REGLA 1: Imagen del logotipo (object-contain, sin filtros oscurecedores) */}
      <div className="absolute inset-0 p-8 pb-28 flex items-center justify-center">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-contain pointer-events-none transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Sutil sombra interna inferior para que el texto sea siempre legible */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] via-[#0A0A0A]/80 to-transparent pointer-events-none" />

      {/* REGLA 3: Badges personalizados de marca */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md",
          getBadgeClasses(slide.badgeColor)
        )}>
          {slide.badge}
        </span>
      </div>

      {/* REGLA 3: Textos (Title y Description) */}
      <div className="absolute bottom-5 left-5 right-5 text-center sm:text-left">
        <motion.p
          style={{
            opacity: useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]),
          }}
          className="text-xl sm:text-2xl font-heading font-bold text-white mb-2 drop-shadow-md"
        >
          {slide.title}
        </motion.p>
        <motion.p
          style={{
            opacity: useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]),
          }}
          className="hidden sm:block text-sm text-neutral-400 font-sans line-clamp-2"
        >
          {slide.description}
        </motion.p>
      </div>
    </motion.div>
  );
};
