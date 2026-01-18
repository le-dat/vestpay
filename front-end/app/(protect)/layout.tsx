"use client";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TopBar } from "@/components/layout/top-bar";
import { getCachedWalletInfo } from "@/lib/sui/passkey";
import { useEffect, useState } from "react";

export default function ProtectLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const info = getCachedWalletInfo();
    if (info) {
      setEmail(info.email);
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 pl-64 flex flex-col">
          <TopBar email={email} />
          <main className="flex-1 p-8 overflow-y-auto custom-scrollbar max-h-[calc(100vh-64px)]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
