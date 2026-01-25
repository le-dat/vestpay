"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/shared/utils";
import { ArrowLeft, Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Brutalist Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Geometric Background Elements */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] right-[10%] w-32 h-32 border-[3px] border-primary/10"
      />
      <motion.div
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[15%] left-[8%] w-24 h-24 border-[3px] border-black/5"
      />
      <div className="absolute top-[60%] right-[15%] w-16 h-16 bg-primary/5" />
      <div className="absolute bottom-[40%] left-[20%] w-20 h-20 bg-black/5" />

      <div className="relative z-10 px-6 max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Error Label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 bg-primary" />
            <span className="text-[10px] font-black text-black uppercase tracking-[0.3em] font-mono">
              Error Code
            </span>
          </motion.div>

          {/* Main 404 Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-white border-[3px] border-black/10 p-12 relative overflow-hidden group hover:border-primary/30 transition-all">
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-[3px] border-t-[3px] border-primary" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-[3px] border-t-[3px] border-primary" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-[3px] border-b-[3px] border-primary" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-[3px] border-b-[3px] border-primary" />

              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                {/* Icon */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="shrink-0"
                >
                  <div className="w-28 h-28 border-[3px] border-black flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <AlertTriangle className="w-14 h-14 text-black" strokeWidth={2.5} />
                  </div>
                </motion.div>

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter text-black mb-4">
                    404
                  </h1>
                  <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider mb-3">
                    Page Not Found
                  </h2>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-md">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
                  </p>
                </div>
              </div>

              {/* Underline Effect */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left"
              />
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href={ROUTES.HOME}
              className="flex-1 group relative"
            >
              <div className="bg-primary hover:bg-black text-white font-black py-6 px-8 transition-all flex items-center justify-center gap-4 relative overflow-hidden active:scale-[0.98] border-4 border-transparent hover:border-primary">
                <motion.div
                  initial={{ x: "-100%", y: "-100%" }}
                  whileHover={{ x: "100%", y: "100%" }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-black/20 skew-x-12"
                />
                <div className="relative flex items-center gap-3">
                  <Home className="w-6 h-6" strokeWidth={2.5} />
                  <span className="text-sm uppercase tracking-[0.2em] font-mono">
                    Back to Home
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex-1 group relative"
            >
              <div className="bg-white hover:bg-gray-50 border-[3px] border-black/10 hover:border-black/40 text-black font-black py-6 px-8 transition-all flex items-center justify-center gap-4 relative overflow-hidden active:scale-[0.98]">
                <div className="relative flex items-center gap-3">
                  <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  <span className="text-sm uppercase tracking-[0.2em] font-mono">
                    Go Back
                  </span>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center gap-3 py-6 border-t border-b border-black/5"
          >
            <div className="w-2 h-2 bg-primary" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] font-mono">
              VestPay Protocol • Error 404
            </span>
            <div className="w-2 h-2 bg-primary" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
