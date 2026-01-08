"use client";

import { Header } from "@/components/header";
import { SupplierLogos } from "@/components/supplier-logos";
import { Benefits } from "@/components/benefits";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { SearchProvider } from "@/context/search-context";

export default function HomeLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isTransparentPage = pathname === "/" || pathname === "/transfer";
  return (
    <div className="min-h-screen bg-white">
      <SearchProvider>
        <Header transparent={isTransparentPage} />
        <main className="w-full">
          {children}

          {isHomePage && (
            <>
              <SupplierLogos />
              <Benefits />
            </>
          )}

          <Footer />
        </main>
      </SearchProvider>
    </div>
  );
}
