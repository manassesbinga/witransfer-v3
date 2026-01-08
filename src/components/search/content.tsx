"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterSidebar } from "@/components/search/sidebar";
import { FilterSidebarSkeleton } from "@/components/skeletons/sidebar";
import { CarResults } from "@/components/search/results";
import { CarResultsSkeleton } from "@/components/skeletons/results";
import { BackToTop } from "@/components/ui/back-to-top";

export function SearchPageContent({
  defaultType,
  initialSearchData,
  initialResults,
  initialSystemData,
}: {
  defaultType?: "rental" | "transfer";
  initialSearchData?: any;
  initialResults?: any;
  initialSystemData?: any;
}) {
  const [isLoading, setIsLoading] = useState(
    !initialSearchData && !initialResults,
  );
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>(
    initialResults?.facets || {},
  );
  const [suppliers, setSuppliers] = useState<any[]>(
    initialResults?.suppliers || [],
  );

  // Se tiver dados iniciais do servidor, usa direto
  const [searchData, setSearchData] = useState<any>(initialSearchData || null);
  const [categoriesData, setCategoriesData] = useState<any[]>(
    initialSystemData?.categories || [],
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function init() {
      // Carregar dados do sistema (categorias, extras, etc) se não vieram do servidor
      if (!initialSystemData) {
        const { getSystemData } = await import("@/actions/public/search/cars");
        try {
          const systemData = await getSystemData();
          setCategoriesData(systemData.categories);
        } catch (e) {
          console.error("Failed to load system data:", e);
        }
      }

      // Se já temos initialSearchData, talvez só precisemos atualizar se a URL mudar depois
      // Mas para o primeiro load, initialSearchData é suficiente.
      // Contudo, se s mudar via navegação client-side, precisamos ouvir searchParams.

      let data: any = initialSearchData || {};

      // If compressed state present in `s` param, prefer it (client navigation)
      const s = searchParams.get("s");
      // Só decodifica se não tivermos data (ou se s mudou - difícil checar aqui sem ref)
      // Lógica simplificada: Se temos initialSearchData e é o primeiro render, ok.
      // Se searchParams mudou, re-decodifica.

      if (s && (!initialSearchData || searchParams.toString() !== "")) {
        try {
          const { decodeState } = await import("@/lib/url-state");
          const decoded = decodeState(s);
          if (decoded) data = decoded;
        } catch (e) {
          console.error("Failed to decode state from URL:", e);
        }
      }

      // ... resto da lógica de fallback sid e legacy ...
      if (!data || Object.keys(data).length === 0) {
        // ... fallback logic ...
        const sid = searchParams.get("sid");
        if (sid) {
          // ...
          try {
            const stored = sessionStorage.getItem(sid);
            if (stored) data = JSON.parse(stored);
          } catch (e) {}
        }
        // legacy params
        if (!data || Object.keys(data).length === 0) {
          searchParams.forEach((val, key) => {
            data[key] = val;
          });
        }
      }

      // Ensure type
      if (!data.type) {
        if (defaultType) data.type = defaultType;
        else if (pathname.includes("/transfer")) data.type = "transfer";
        else if (pathname.includes("/rental")) data.type = "rental";
      }

      setSearchData(data);
      setIsLoading(false);
    }

    init();
  }, [searchParams, pathname, router, defaultType]); // initialSearchData removed from dep array to avoid loops

  return (
    <>
      <div className="flex-grow relative">
        <main className="flex-grow relative">
          {isLoading ? (
            <div className="w-full pl-[20px] pr-2 md:pr-4 py-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <FilterSidebarSkeleton />
                <CarResultsSkeleton />
              </div>
            </div>
          ) : (
            <div className="w-full pl-[20px] pr-2 md:pr-4 py-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <FilterSidebar
                  facets={facets}
                  suppliers={suppliers}
                  categoriesData={categoriesData}
                />
                <CarResults
                  searchData={searchData}
                  initialResults={initialResults}
                  facets={facets}
                  suppliers={suppliers}
                  onDataChange={(data) => {
                    setFacets(data.facets);
                    setSuppliers(data.suppliers);
                  }}
                />
              </div>
            </div>
          )}
        </main>
        <BackToTop />
      </div>
    </>
  );
}
