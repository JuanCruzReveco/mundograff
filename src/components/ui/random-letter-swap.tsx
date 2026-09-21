"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";

export interface RandomLetterSwapProps {
  label: string;
  className?: string;
  /** Delay between each letter starting its roll */
  staggerDuration?: number;
  /** Spring config for the roll animation */
  transition?: Record<string, unknown>;
}

export function RandomLetterSwap({
  label,
  className = "",
  staggerDuration = 0.04,
  transition = { type: "spring", stiffness: 180, damping: 14 },
}: RandomLetterSwapProps) {
  const chars = label.split("");
  const [trigger, setTrigger] = useState(0);
  const isAnimatingRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setTrigger((t) => t + 1);

    // Cooldown para permitir re-trigger después de que la animación termine
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, chars.length * (staggerDuration * 1000) + 600);
  }, [chars.length, staggerDuration]);

  return (
    <span
      className={className}
      onMouseEnter={handleMouseEnter}
      style={{
        display: "inline-flex",
        perspective: "500px",
        overflow: "hidden",
      }}
    >
      {chars.map((char, index) => (
        <motion.span
          key={`${index}-${trigger}`}
          initial={{ y: 25, rotateX: 90, opacity: 0 }}
          animate={{ y: 0, rotateX: 0, opacity: 1 }}
          transition={{
            ...transition,
            delay: index * staggerDuration,
          }}
          style={{
            display: "inline-block",
            minWidth: char === " " ? "0.25em" : undefined,
            transformOrigin: "bottom center",
            willChange: "transform, opacity",
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
