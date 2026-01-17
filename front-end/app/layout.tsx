import type { Metadata } from "next";
import { Exo_2, Playfair_Display } from "next/font/google";
import "./globals.css";
import { NetworkProvider } from "@/lib/context/NetworkContext";

const exo2 = Exo_2({ subsets: ["latin"], variable: "--font-exo-2" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

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
      <body className={`${exo2.variable} ${playfair.variable} font-sans `} suppressHydrationWarning>
        <NetworkProvider>{children}</NetworkProvider>
      </body>
    </html>
  );
}
