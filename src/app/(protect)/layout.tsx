"use client";

import { ProtectedRoute } from "@/features/auth";
import { getCachedWalletInfo } from "@/integrations/sui/passkey";
import { DashboardSidebar, TopBar } from "@/shared/components/layout";
import { useState } from "react";

export default function ProtectLayout({ children }: { children: React.ReactNode }) {
  const [email] = useState<string | undefined>(() => {
    const info = getCachedWalletInfo();
    return info?.email;
  });

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
