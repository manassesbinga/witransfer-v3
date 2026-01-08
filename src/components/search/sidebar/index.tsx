"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

import { Supplier } from "@/types/cars";

export function FilterContent({
  facets,
  suppliers = [],
  handleFilterChange,
  isChecked,
  handleClearAll,
}: {
  facets: Record<string, Record<string, number>>;
  suppliers?: Supplier[];
  handleFilterChange: (key: string, value: string, checked: boolean) => void;
  isChecked: (key: string, value: string) => boolean;
  handleClearAll: () => void;
}) {
  return (
    <div className="divide-y divide-gray-100 overflow-y-auto no-scrollbar">
      <FilterSection
        title="Transmissão"
        filterKey="trans"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "automatico", name: "Automático" },
          { id: "manual", name: "Manual" },
        ]}
      />

      <FilterSection
        title="Fornecedor"
        filterKey="sup"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          logo: s.logo,
        }))}
      />

      <FilterSection
        title="Quilometragem"
        filterKey="mileage"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "limited", name: "Limitada" },
          { id: "unlimited", name: "Ilimitada" },
        ]}
      />

      <FilterSection
        title="Extras"
        filterKey="extras"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "driver", name: "Motorista incluído" },
          { id: "insurance", name: "Seguro Todo Risco" },
          { id: "limpeza", name: "Limpeza Profissional" },
          { id: "wifi", name: "Wi-Fi Grátis" },
          { id: "gps", name: "GPS" },
          { id: "baby_seat", name: "Cadeira de bebé" },
        ]}
      />

      <FilterSection
        title="Preço por dia"
        filterKey="price_range"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "0-50000", name: "0 Kz - 50.000 Kz" },
          { id: "50000-100000", name: "50.000 Kz - 100.000 Kz" },
          { id: "100000-150000", name: "100.000 Kz - 150.000 Kz" },
          { id: "150000-200000", name: "150.000 Kz - 200.000 Kz" },
          { id: "200000+", name: "200.000 Kz +" },
        ]}
      />

      <FilterSection
        title="Número de lugares"
        filterKey="seats"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "4", name: "4 lugares" },
          { id: "5", name: "5 lugares" },
          { id: "6+", name: "6+ lugares" },
        ]}
      />

      <FilterSection
        title="Avaliação"
        filterKey="score"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "9", name: "Excelente: 9+" },
          { id: "8", name: "Muito bom: 8+" },
          { id: "7", name: "Bom: 7+" },
        ]}
      />

      <FilterSection
        title="Quando pagar"
        filterKey="pay"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "now", name: "Pagar agora" },
          { id: "pickup", name: "Pagar na retirada" },
        ]}
      />

      <FilterSection
        title="Especificações"
        filterKey="spec"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "ac", name: "Ar-condicionado" },
          { id: "doors4", name: "4+ portas" },
        ]}
      />

      <FilterSection
        title="Carros elétricos"
        filterKey="electric"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "full", name: "Totalmente elétrico" },
          { id: "hybrid", name: "Híbrido" },
          { id: "plug-in", name: "Híbrido plug-in" },
        ]}
      />

      <FilterSection
        title="Depósito na retirada"
        filterKey="deposit"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[
          { id: "0-6250", name: "ZAR 0 - ZAR 6.250" },
          { id: "6250-12500", name: "ZAR 6.250 - ZAR 12.500" },
          { id: "12500+", name: "ZAR 12.500 +" },
        ]}
      />

      <FilterSection
        title="Política de combustível"
        filterKey="fuel"
        facets={facets}
        isChecked={isChecked}
        handleFilterChange={handleFilterChange}
        items={[{ id: "like", name: "Cheio por cheio" }]}
      />
    </div>
  );
}

const FilterSection = ({
  title,
  items,
  filterKey,
  facets,
  isChecked,
  handleFilterChange,
}: any) => (
  <div className="p-3">
    <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-tight text-[11px]">
      {title}
    </h3>
    <div className="space-y-3">
      {items.map((item: any) => {
        const dynamicCount = facets?.[filterKey]?.[item.id] ?? 0;

        return (
          <label
            key={item.id}
            className={cn(
              "flex items-center justify-between cursor-pointer group transition-opacity",
              dynamicCount === 0 &&
                !isChecked(filterKey, item.id) &&
                "opacity-60 grayscale-[0.5]",
            )}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isChecked(filterKey, item.id)}
                onCheckedChange={(checked) =>
                  handleFilterChange(filterKey, item.id, !!checked)
                }
                className="h-4 w-4 rounded-[2px] border-gray-300 data-[state=checked]:bg-[#003580] data-[state=checked]:border-[#003580]"
              />
              {item.logo ? (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-12 bg-gray-50 rounded border border-gray-100 flex items-center justify-center p-1">
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <span className="text-[13px] text-gray-700 group-hover:text-gray-900 transition-colors font-medium">
                    {item.name}
                  </span>
                </div>
              ) : (
                <span className="text-[13px] text-gray-700 group-hover:text-gray-900 transition-colors font-medium text-wrap">
                  {item.name}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-bold ml-2">
              {dynamicCount}
            </span>
          </label>
        );
      })}
    </div>
  </div>
);

export function FilterSidebar({
  facets,
  suppliers = [],
  categoriesData = [],
}: {
  facets: Record<string, Record<string, number>>;
  suppliers?: Supplier[];
  categoriesData?: any[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleFilterChange = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const existingValues = params.get(key)?.split(",") || [];

    let nextValues: string[];
    if (checked) {
      nextValues = [...existingValues, value];
    } else {
      nextValues = existingValues.filter((v) => v !== value);
    }

    if (nextValues.length > 0) {
      params.set(key, nextValues.join(","));
    } else {
      params.delete(key);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isChecked = (key: string, value: string) => {
    return (searchParams.get(key)?.split(",") || []).includes(value);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    const filters = [
      "loc",
      "sup",
      "spec",
      "pol",
      "mileage",
      "extras",
      "cat",
      "price",
      "seats",
      "score",
      "pay",
      "fuel",
      "deposit",
      "trans",
      "service_type",
      "inc",
    ];
    filters.forEach((k) => params.delete(k));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="w-full lg:w-60 flex-shrink-0 hidden lg:flex lg:sticky lg:top-[20px] h-fit max-h-[calc(100vh-40px)] flex-col">
      <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">
            Filtros
          </h2>
          <button
            onClick={handleClearAll}
            className="text-[#006ce4] text-xs font-bold hover:underline"
          >
            Limpar tudo
          </button>
        </div>

        <FilterContent
          facets={facets}
          suppliers={suppliers}
          handleFilterChange={handleFilterChange}
          isChecked={isChecked}
          handleClearAll={handleClearAll}
        />
      </div>
    </aside>
  );
}
