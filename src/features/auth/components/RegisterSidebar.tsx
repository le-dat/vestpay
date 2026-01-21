"use client";

import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { FloatingDots } from "./FloatingDots";

export function RegisterSidebar() {
  return (
    <>
      <FloatingDots count={40} opacity={0.4} />

      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 0.03 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-0 right-0 w-[200%] h-full bg-linear-to-br from-primary/10 to-transparent -rotate-12 origin-top-right"
      />

      <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-primary/30" />

      <div className="relative z-10 w-full max-w-xl px-12 flex flex-col">
        <div className="relative mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-32 h-32 mx-auto"
          >
            {[0, 1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: 1 + ring * 0.25,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: ring * 0.3,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 border-2 border-primary rounded-full"
                style={{ borderStyle: ring % 2 === 0 ? "solid" : "dashed" }}
              />
            ))}
            <Fingerprint
              className="absolute inset-0 m-auto w-16 h-16 text-primary"
              strokeWidth={1.5}
            />
          </motion.div>

          <motion.div
            animate={{ y: [-20, 140] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-60"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-baseline gap-3 mb-6">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em] font-mono">
              Biometric Security
            </span>
          </div>

          <h2 className="text-6xl font-black text-white mb-4 leading-[0.95] tracking-tighter">
            NO SEED
            <br />
            <span className="text-primary">PHRASES</span>
            <br />
            NO KEYS
          </h2>

          <div className="w-24 h-1 bg-linear-to-r from-primary to-transparent mb-6" />

          <p className="text-gray-400 text-base font-medium leading-relaxed max-w-md">
            Your fingerprint <span className="text-primary font-bold">is</span> your wallet. Powered
            by Sui blockchain and device-native passkeys.
          </p>
        </motion.div>

        <div className="space-y-3">
          {[
            { label: "Non-Custodial", detail: "100% Ownership" },
            { label: "Zero Gas Fees", detail: "Abstracted Away" },
            { label: "Biometric Auth", detail: "FaceID • TouchID" },
            { label: "Sui Network", detail: "Next-Gen Speed" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-4 group cursor-default"
              style={{ paddingLeft: `${i * 12}px` }}
            >
              <div className="w-6 h-6 border-2 border-primary/40 group-hover:border-primary flex items-center justify-center transition-colors">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="w-2 h-2 bg-primary"
                />
              </div>
              <div className="flex-1 border-l-2 border-white/5 pl-4 py-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-white font-black text-sm uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-gray-600 text-xs font-mono">{item.detail}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="mt-16 h-px bg-linear-to-r from-primary via-primary/20 to-transparent origin-left"
        />
      </div>
    </>
  );
}
