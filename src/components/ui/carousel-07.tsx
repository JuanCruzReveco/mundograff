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
  fullCover?: boolean;
}

const slides: Slide[] = [
  {
    image: "/clientes/maf logo.jpg",
    title: "MAF",
    description: "Agroindustria comprometida con la excelencia y la calidad.",
    badge: "Agroindustria",
    badgeColor: "teal",
    fullCover: true
  },
  {
    image: "/clientes/vistalba-logo-png_seeklogo-149844-removebg-preview.png",
    title: "Bodega Vistalba",
    description: "Prestigiosa bodega de Luján de Cuyo, elaboradora de vinos de alta gama.",
    badge: "Bodega",
    badgeColor: "crimson"
  },
  {
    image: "/clientes/logo-termax.png",
    title: "Termax Argentina",
    description: "Fabricación y venta de furgones térmicos y unidades móviles en Maipú.",
    badge: "Industria",
    badgeColor: "teal"
  },
  {
    image: "/clientes/mitre_srl-removebg-preview.png",
    title: "Transportes Mitre",
    description: "Reconocida empresa de transporte de pasajeros y logística de Mendoza.",
    badge: "Transporte",
    badgeColor: "orange"
  },
  {
    image: "/clientes/cropped-01-GRUPO-TERRALOGIC-768x265.png.webp",
    title: "Grupo Terralogic",
    description: "Soluciones integrales en logística y transporte internacional de carga.",
    badge: "Logística",
    badgeColor: "teal"
  },
  {
    image: "/clientes/brunetti-removebg-preview.png",
    title: "Armando Brunetti",
    description: "Empresa histórica dedicada a la fruticultura, empaque y comercialización.",
    badge: "Agroindustria",
    badgeColor: "crimson"
  },
  {
    image: "/clientes/elecnor-removebg-preview.png",
    title: "Grupo Elecnor",
    description: "Compañía global en desarrollo y construcción de proyectos.",
    badge: "Ingeniería",
    badgeColor: "teal"
  },
  {
    image: "/clientes/soeva-removebg-preview.png",
    title: "SOEVA",
    description: "Sindicato de Obreros y Empleados Vitivinícolas y Afines de la provincia.",
    badge: "Institución",
    badgeColor: "orange"
  },
  {
    image: "/clientes/images-removebg-preview.png",
    title: "IAR",
    description: "Empresa creadora de audífonos con la más alta tecnología.",
    badge: "Salud",
    badgeColor: "crimson"
  }
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
      {/* REGLA 1: Imagen del logotipo */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center",
        slide.fullCover ? "" : "p-8 pb-28"
      )}>
        <img
          src={slide.image}
          alt={slide.title}
          className={cn(
            "w-full h-full pointer-events-none transition-transform duration-700 group-hover:scale-105",
            slide.fullCover ? "object-cover" : "object-contain"
          )}
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
