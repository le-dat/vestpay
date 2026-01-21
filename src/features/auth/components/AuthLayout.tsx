"use client";

import { motion } from "framer-motion";
import Logo from "@/shared/components/branding";
import { ROUTES } from "@/shared/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
}

export default function AuthLayout({ children, sidebarContent }: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden font-sans">
      {/* Sidebar Section */}
      <div className="hidden md:flex flex-1 bg-[#0A0A0A] relative items-center justify-center overflow-hidden border-r border-white/5">
        {sidebarContent}
      </div>

      {/* Main Content Section */}
      <div className="flex-1 bg-white flex flex-col relative px-8 py-12 md:px-20 lg:px-24 xl:px-32 justify-between overflow-hidden">
        {/* Decorative corner borders */}
        <div className="absolute top-0 right-0 w-24 h-24 border-r-[3px] border-t-[3px] border-black/5" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-l-[3px] border-b-[3px] border-black/5" />

        {/* Animated background elements */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-12 w-2 h-2 bg-primary/20"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-20 w-3 h-3 border-2 border-primary/30"
        />

        {/* Header/Logo */}
        <div className="flex justify-center md:justify-start relative z-10">
          <motion.a
            href={ROUTES.HOME}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-2 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
            <Logo />
          </motion.a>
        </div>

        {/* Form Container */}
        <div className="max-w-[420px] w-full mx-auto md:mx-0 py-12 relative z-10">{children}</div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] pt-8 relative z-10 font-mono"
        >
          <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
            <div className="w-1 h-1 bg-primary" />
            FAQ
          </a>
          <div className="flex items-center gap-2">
            <span>v0.1.0</span>
            <div className="w-1 h-1 bg-gray-300" />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
