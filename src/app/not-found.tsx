"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/shared/utils";
import { ArrowLeft, Home, SearchX } from "lucide-react";

const NotFound = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 px-6 max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon Container */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
              />
              <div className="relative glass p-8 rounded-3xl border-primary/20">
                <SearchX className="w-20 h-20 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter mb-4 text-gradient">
            404
          </h1>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Lost in the Chain</h2>

          <p className="text-lg text-secondary mb-12 max-w-md mx-auto leading-relaxed">
            The block you&apos;re looking for doesn&apos;t exist or has been moved to a different
            transaction.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ROUTES.HOME}
              className="group relative px-8 py-4 bg-primary text-white font-bold rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(0,208,132,0.4)] flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>

            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 glass text-foreground font-bold rounded-2xl border-secondary/20 hover:border-primary/50 transition-all flex items-center gap-2 w-full sm:w-auto justify-center group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative text */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-primary/10 font-mono text-sm tracking-[0.5em] uppercase pointer-events-none">
        VestPay Protocol • Error 404
      </div>
    </div>
  );
};

export default NotFound;
