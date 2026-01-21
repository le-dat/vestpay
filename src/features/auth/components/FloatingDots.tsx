"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FloatingDotsProps {
  count?: number;
  opacity?: number;
}

export function FloatingDots({ count = 30, opacity = 0.3 }: FloatingDotsProps) {
  const [dots] = useState(() => {
    return [...Array(count)].map((_, i) => ({
      id: i,
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      scale: Math.random() * 0.5 + 0.5,
      animateX: Math.random() * 100 + "%",
      animateY: Math.random() * 100 + "%",
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 5,
      boxShadow: `0 0 ${Math.random() * 15 + 8}px rgba(0, 208, 132, 0.5)`,
    }));
  });

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          initial={{
            x: dot.x,
            y: dot.y,
            scale: dot.scale,
          }}
          animate={{
            y: [null, dot.animateY],
            x: [null, dot.animateX],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "linear",
            delay: dot.delay,
          }}
          className="absolute w-0.5 h-0.5 bg-primary rounded-full"
          style={{
            boxShadow: dot.boxShadow,
          }}
        />
      ))}
    </div>
  );
}
