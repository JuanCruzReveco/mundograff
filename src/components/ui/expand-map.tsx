"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"

interface LocationMapProps {
  location?: string
  coordinates?: string
  className?: string
}

export function LocationMap({
  location = "Maza norte 3557, M5515 Maipú, Mendoza",
  coordinates = "3648+VM Maipú, Mendoza",
  className,
}: LocationMapProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-50, 50], [8, -8])
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8])

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const handleClick = () => {
    setIsExpanded(!isExpanded)
  }

  // Detección de OS para abrir el mapa correcto
  const handleNavigation = (e: React.MouseEvent) => {
    e.stopPropagation()
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
    const url = isApple
      ? "http://maps.apple.com/?q=Maza+norte+3557,+Maipu,+Mendoza"
      : "https://maps.google.com/?q=Maza+norte+3557,+Maipu,+Mendoza"
    window.open(url, "_blank")
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-[#0A1124] border border-white/10 w-full mx-auto max-w-[380px]"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          maxWidth: isExpanded ? 380 : 260,
          height: isExpanded ? 320 : 150,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 35,
        }}
      >
        {/* Gradient overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#008E7A]/10 via-transparent to-[#7A225B]/15" />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-[#060E1E]" />

              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                {/* Calles principales horizontales — Verde Teal */}
                <motion.line
                  x1="0%" y1="35%" x2="100%" y2="35%"
                  stroke="#008E7A" strokeWidth="4" strokeOpacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
                <motion.line
                  x1="0%" y1="65%" x2="100%" y2="65%"
                  stroke="#008E7A" strokeWidth="4" strokeOpacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />

                {/* Calles principales verticales — Verde Teal */}
                <motion.line
                  x1="30%" y1="0%" x2="30%" y2="100%"
                  stroke="#008E7A" strokeWidth="3" strokeOpacity="0.45"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />
                <motion.line
                  x1="70%" y1="0%" x2="70%" y2="100%"
                  stroke="#008E7A" strokeWidth="3" strokeOpacity="0.45"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />

                {/* Calles secundarias horizontales — Violeta */}
                {[20, 50, 80].map((y, i) => (
                  <motion.line
                    key={`h-${i}`}
                    x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`}
                    stroke="#7A225B" strokeWidth="1.5" strokeOpacity="0.35"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                  />
                ))}
                {/* Calles secundarias verticales — Violeta */}
                {[15, 45, 55, 85].map((x, i) => (
                  <motion.line
                    key={`v-${i}`}
                    x1={`${x}%`} y1="0%" x2={`${x}%`} y2="100%"
                    stroke="#7A225B" strokeWidth="1.5" strokeOpacity="0.35"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  />
                ))}
              </svg>

              {/* Bloques / Edificios */}
              {[
                { top: "40%", left: "10%", w: "15%", h: "20%", delay: 0.5 },
                { top: "15%", left: "35%", w: "12%", h: "15%", delay: 0.6 },
                { top: "70%", left: "75%", w: "18%", h: "18%", delay: 0.7 },
                { top: "20%", left: "80%", w: "10%", h: "25%", delay: 0.55 },
                { top: "55%", left: "5%",  w: "8%",  h: "12%", delay: 0.65 },
                { top: "8%",  left: "75%", w: "14%", h: "10%", delay: 0.75 },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-sm bg-[#008E7A]/15 border border-[#008E7A]/10"
                  style={{ top: b.top, left: b.left, width: b.w, height: b.h }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: b.delay }}
                />
              ))}

              {/* Pin de ubicación — Naranja Fuego */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
              >
                <svg
                  width="32" height="32" viewBox="0 0 24 24" fill="none"
                  className="drop-shadow-lg"
                  style={{ filter: "drop-shadow(0 0 10px rgba(255, 90, 0, 0.6))" }}
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF5A00" />
                  <circle cx="12" cy="9" r="2.5" fill="#0A1124" />
                </svg>
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1124] via-transparent to-transparent opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid pattern colapsado */}
        <motion.div
          className="absolute inset-0 opacity-[0.04]"
          animate={{ opacity: isExpanded ? 0 : 0.04 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid-map" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#008E7A" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-map)" />
          </svg>
        </motion.div>

        {/* Contenido */}
        <div className="relative z-10 h-full flex flex-col justify-between p-5">
          {/* Top: ícono + indicador */}
          <div className="flex items-start justify-between">
            <motion.div
              animate={{ opacity: isExpanded ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-[#FF5A00]"
                animate={{
                  filter: isHovered
                    ? "drop-shadow(0 0 8px rgba(255, 90, 0, 0.6))"
                    : "drop-shadow(0 0 4px rgba(255, 90, 0, 0.3))",
                }}
                transition={{ duration: 0.3 }}
              >
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" x2="9" y1="3" y2="18" />
                <line x1="15" x2="15" y1="6" y2="21" />
              </motion.svg>
            </motion.div>

            {/* Live dot — Naranja Fuego */}
            <motion.div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 backdrop-blur-sm"
              animate={{
                scale: isHovered ? 1.05 : 1,
                backgroundColor: isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
              <span className="text-[10px] font-medium text-neutral-400 tracking-wide uppercase">Live</span>
            </motion.div>
          </div>

          {/* Bottom: dirección, coordenadas, botón */}
          <div className="space-y-1.5">
            <motion.h3
              className="text-white font-medium text-sm tracking-tight"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {location}
            </motion.h3>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  <p className="text-neutral-500 text-xs font-mono">
                    {coordinates}
                  </p>

                  {/* Botón "Cómo llegar" — Glassmorphism oscuro */}
                  <button
                    onClick={handleNavigation}
                    className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wide uppercase hover:bg-[#FF5A00] hover:border-[#FF5A00] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,90,0,0.3)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    Cómo llegar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Línea animada inferior — Naranja Fuego */}
            <motion.div
              className="h-px bg-gradient-to-r from-[#FF5A00]/50 via-[#FF5A00]/30 to-transparent"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: isHovered || isExpanded ? 1 : 0.3 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Hint de click */}
      <motion.p
        className="absolute -bottom-6 left-1/2 text-[10px] text-neutral-500 whitespace-nowrap"
        style={{ x: "-50%" }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isHovered && !isExpanded ? 1 : 0,
          y: isHovered ? 0 : 4,
        }}
        transition={{ duration: 0.2 }}
      >
        Click para expandir
      </motion.p>
    </motion.div>
  )
}
