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
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="absolute"
          style={{
            width: "80vw",
            height: "80vh",
            background: "radial-gradient(ellipse at center, rgba(30,8,12,0.8) 0%, transparent 70%)",
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
