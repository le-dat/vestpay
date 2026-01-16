import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NetworkProvider } from "@/lib/context/NetworkContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Passkey Sui Wallet - Secure Web3 Wallet",
  description: "Secure Web3 wallet powered by Passkey authentication on Sui blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NetworkProvider>
          {children}
        </NetworkProvider>
      </body>
    </html>
  );
}
