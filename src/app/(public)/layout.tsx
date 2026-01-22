"use client";

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
    <div className="min-h-screen bg-white">
      <SearchProvider>
        <Header transparent={isTransparentPage} />
        <main className="w-full">
          {children}

          <Footer />
        </main>
      </SearchProvider>
    </div>
  );
}
