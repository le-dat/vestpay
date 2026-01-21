"use client";

import { AuthLayout, RegisterSidebar, RegisterForm } from "@/features/auth";
import { ROUTES } from "@/shared/utils";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <AuthLayout sidebarContent={<RegisterSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-12 bg-primary" />
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-5xl md:text-6xl font-black text-black tracking-[-0.02em] leading-none"
              >
                CREATE
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-5xl md:text-6xl font-black text-black tracking-[-0.02em]">
                  WALLET
                </span>
                <div className="w-2 h-2 bg-primary mb-2" />
              </motion.div>
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em] ml-4"
          >
            Biometric • Blockchain • Secure
          </motion.p>
        </div>

        <RegisterForm />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="text-sm font-medium text-gray-500">
            Already have a wallet?{" "}
            <a
              href={ROUTES.LOGIN}
              className="text-black font-black hover:text-primary transition-colors relative group inline-block"
            >
              <span className="relative z-10">SIGN IN</span>
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left"
              />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
