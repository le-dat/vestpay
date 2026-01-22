"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { FloatingDots } from "./FloatingDots";

export function LoginSidebar() {
  return (
    <>
      <FloatingDots count={30} opacity={0.3} />

      <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-primary/30" />

      <div className="relative z-10 w-full max-w-2xl px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-px bg-linear-to-r from-transparent to-primary" />
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em] font-mono">
              The Difference
            </span>
            <div className="w-12 h-px bg-linear-to-l from-transparent to-primary" />
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
            OLD WORLD
            <br />
            <span className="text-primary">VS</span>
            <br />
            NEW ERA
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-gray-500" />
              <span className="text-gray-500 font-black text-xs uppercase tracking-[0.25em] font-mono">
                Traditional
              </span>
            </div>

            {[
              { label: "3-5 Days", sublabel: "Transfer Time" },
              { label: "High Fees", sublabel: "Hidden Costs" },
              { label: "Passwords", sublabel: "Security Risk" },
              { label: "Custodial", sublabel: "No True Control" },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 border-2 border-gray-700 flex items-center justify-center">
                  <X className="w-3 h-3 text-gray-600" strokeWidth={3} />
                </div>
                <div>
                  <div className="text-gray-400 text-sm font-bold">{item.label}</div>
                  <div className="text-gray-700 text-[10px] font-mono">{item.sublabel}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6 border-l-2 border-primary/20 pl-6"
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-primary" />
              <span className="text-primary font-black text-xs uppercase tracking-[0.25em] font-mono">
                VestPay
              </span>
            </div>

            {[
              { label: "Instant", sublabel: "Real-Time Transfers" },
              { label: "Zero Fees", sublabel: "Gas Abstracted" },
              { label: "Biometric", sublabel: "Passkey Security" },
              { label: "Self-Custody", sublabel: "True Ownership" },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 border-2 border-primary flex items-center justify-center bg-primary/10">
                  <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">{item.label}</div>
                  <div className="text-gray-500 text-[10px] font-mono">{item.sublabel}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="mt-20 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center mt-8 text-gray-500 text-sm font-mono"
        >
          Powered by Sui Blockchain
        </motion.p>
      </div>
    </>
  );
}
