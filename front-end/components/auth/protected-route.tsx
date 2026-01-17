"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasWallet } from "@/lib/sui/passkey";
import { ROUTES } from "@/lib/utils/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (!hasWallet()) {
        router.replace(ROUTES.LOGIN);
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);

  // Show nothing while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-secondary animate-pulse">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  // If not authorized, the useEffect will handle redirection
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
