"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const LAYER_COUNT = 6;
const CYCLE_DURATION = 20;

const LAYERS = Array.from({ length: LAYER_COUNT }, (_, i) => ({
  delay: (i / LAYER_COUNT) * CYCLE_DURATION,
  parallax: 15 + i * 8,
  isWarm: i % 2 === 0,
}));

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

  // Use CSS variables instead of JS arrays to prevent React re-renders on theme change
  const gradientVar = layer.isWarm 
    ? `var(--tunnel-warm-${index % 2})`
    : `var(--tunnel-dark-${index % 2})`;

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
            background: gradientVar,
            borderRadius: "50%",
            transform: "translateZ(0)", 
          }}
        />
      </div>
    </motion.div>
  );
}

export default function TunnelBackground() {
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 80, damping: 20, mass: 0.8 });
  const mouseY = useSpring(rawMouseY, { stiffness: 80, damping: 20, mass: 0.8 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      rawMouseX.set(nx);
      rawMouseY.set(ny);
    };

    const handleMouseLeave = () => {
      rawMouseX.set(0);
      rawMouseY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [rawMouseX, rawMouseY]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        :root {
          --tunnel-warm-0: radial-gradient(ellipse at center, rgba(255,90,0,0.12) 0%, rgba(255,162,0,0.06) 40%, transparent 80%);
          --tunnel-warm-1: radial-gradient(ellipse at center, rgba(255,120,0,0.1) 0%, rgba(255,150,0,0.05) 45%, transparent 80%);
          --tunnel-dark-0: radial-gradient(ellipse at center, rgba(12,28,71,0.08) 0%, rgba(12,28,71,0.03) 40%, transparent 80%);
          --tunnel-dark-1: radial-gradient(ellipse at center, rgba(0,142,122,0.06) 0%, rgba(0,142,122,0.02) 45%, transparent 80%);
          --tunnel-bg: radial-gradient(ellipse at center, rgba(255,90,0,0.12) 0%, transparent 75%);
        }
        :root.dark {
          --tunnel-warm-0: radial-gradient(ellipse at center, rgba(255,90,0,0.3) 0%, rgba(158,0,43,0.15) 40%, transparent 80%);
          --tunnel-warm-1: radial-gradient(ellipse at center, rgba(255,100,0,0.2) 0%, rgba(200,20,40,0.1) 45%, transparent 80%);
          --tunnel-dark-0: radial-gradient(ellipse at center, rgba(12,28,71,0.2) 0%, rgba(0,142,122,0.1) 40%, transparent 80%);
          --tunnel-dark-1: radial-gradient(ellipse at center, rgba(0,142,122,0.2) 0%, rgba(12,28,71,0.1) 45%, transparent 80%);
          --tunnel-bg: radial-gradient(ellipse at center, rgba(255,90,0,0.15) 0%, transparent 70%);
        }
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
        .tunnel-ring-scaler {
          position: absolute;
          top: 50%;
          left: 50%;
          animation: tunnel-expand ${CYCLE_DURATION}s linear infinite;
          will-change: transform, opacity;
        }
      `}</style>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-70 dark:opacity-100 transition-opacity duration-700">
        <div
          className="absolute"
          style={{
            width: "80vw",
            height: "80vh",
            background: "var(--tunnel-bg)",
            borderRadius: "50%",
            transform: "translateZ(0)",
          }}
        />
        {LAYERS.map((layer, i) => (
          <TunnelLayer key={i} layer={layer} index={i} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>
    </div>
  );
}
