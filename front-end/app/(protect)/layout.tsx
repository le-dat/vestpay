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
      <div className="flex min-h-screen bg-gray-50/50">
        <DashboardSidebar />
        <div className="flex-1 pl-64 flex flex-col">
          <TopBar email={email} />
          <main className="flex-1">
            <div className="container mx-auto p-8 max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
