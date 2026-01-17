import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { NetworkProvider } from "@/lib/context/NetworkContext";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: "VestPay - Secure Web3 Wallet",
  description: "Secure Web3 wallet powered by Passkey authentication on Sui blockchain",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${archivo.variable} font-sans `} suppressHydrationWarning>
        <NetworkProvider>{children}</NetworkProvider>
      </body>
    </html>
  );
}
