"use client";

import Loading from "@/app/loading";
import { hasWallet } from "@/lib/sui/passkey";
import { ROUTES } from "@/lib/utils/routes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  if (isAuthorized === null) {
    return <Loading />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
