"use client";

import { createPasskeyWallet } from "@/integrations/sui/passkey";
import { validateEmail, ROUTES } from "@/shared/utils";
import { motion } from "framer-motion";
import { Check, Fingerprint, Mail, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email to create your wallet");
      return;
    }

    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error || "Invalid email");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      await createPasskeyWallet(email);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create wallet. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative group"
      >
        <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3 flex font-mono items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary" />
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-white border-[3px] border-black/10 px-6 py-4 text-black placeholder-gray-300 focus:border-primary focus:bg-primary/2 transition-all outline-none font-medium text-lg"
            required
          />
          <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileFocus={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="flex items-start gap-4 py-4 border-l-2 border-black/5 pl-6"
      >
        <button
          type="button"
          onClick={() => setAgreedToTerms(!agreedToTerms)}
          className={`mt-0.5 w-6 h-6 border-[3px] shrink-0 flex items-center justify-center transition-all ${
            agreedToTerms ? "bg-primary border-primary" : "border-black/20 hover:border-black/40"
          }`}
        >
          {agreedToTerms && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Check className="w-4 h-4 text-white" strokeWidth={4} />
            </motion.div>
          )}
        </button>
        <span
          className="text-xs text-gray-600 font-medium cursor-pointer select-none leading-relaxed"
          onClick={() => setAgreedToTerms(!agreedToTerms)}
        >
          I understand that my wallet is secured by this device&apos;s{" "}
          <span className="font-black text-black">Passkey</span> and I should not lose access to it.
        </span>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-5 text-sm font-bold text-red-700"
        >
          <div className="flex items-start gap-3">
            <X className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={3} />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-black text-white font-black py-6 transition-all flex items-center justify-center gap-4 group relative overflow-hidden active:scale-[0.98] disabled:grayscale disabled:opacity-50 border-4 border-transparent hover:border-primary"
      >
        <motion.div
          initial={{ x: "-100%", y: "-100%" }}
          whileHover={{ x: "100%", y: "100%" }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-black/20 skew-x-12"
        />

        <div className="relative flex items-center gap-4">
          <motion.div
            animate={loading ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
          >
            <Fingerprint className="w-7 h-7" strokeWidth={2.5} />
          </motion.div>
          <span className="text-base uppercase tracking-[0.2em] font-mono">
            {loading ? "Creating..." : "Create Wallet"}
          </span>
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="flex items-center justify-center gap-3 py-4 border-t border-b border-black/5"
      >
        <div className="w-6 h-6 border-2 border-primary/30 flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] font-mono">
          Device-Native Security
        </span>
      </motion.div>
    </form>
  );
}
