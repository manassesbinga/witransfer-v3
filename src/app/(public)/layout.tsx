"use client";

import React, { Suspense } from "react";
import { Header } from "@/components/header/public";
import { usePathname } from "next/navigation";
import { Footer } from "@/components";
import { SearchProvider } from "@/context/search-context";

export default function HomeLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTransparentPage = pathname === "/" || pathname === "/transfer";
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SearchProvider>
        <Suspense fallback={<div className="h-20 bg-[#003580] animate-pulse" />}>
          <Header transparent={isTransparentPage} />
        </Suspense>
        <main className="w-full">
          <Suspense fallback={<div className="flex items-center justify-center p-20">Loading...</div>}>
            {children}
          </Suspense>
          <Footer />
        </main>
      </SearchProvider>
    </div>
  );
}
