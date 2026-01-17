"use client";

import { motion } from "framer-motion";

interface FloatingDotsProps {
  count?: number;
  opacity?: number;
}

export default function FloatingDots({ count = 30, opacity = 0.3 }: FloatingDotsProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, `${Math.random() * 100}%`],
            x: [null, `${Math.random() * 100}%`],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 25 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          className="absolute w-0.5 h-0.5 bg-primary rounded-full"
          style={{
            boxShadow: `0 0 ${Math.random() * 15 + 8}px rgba(0, 208, 132, 0.5)`,
          }}
        />
      ))}
    </div>
  );
}
