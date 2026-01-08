import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WiTransfer – Aluguel de Carros e Viagens de Longa Distância",
  description:
    "Alugue carros e faça viagens de longa distância com conforto, segurança e preços acessíveis",
  generator: "witransfer.app",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
