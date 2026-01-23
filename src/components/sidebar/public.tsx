"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

import { Supplier, Category } from "@/types";

export function FilterContent({
  facets,
  suppliers = [],
  categoriesData = [],
  extrasData = [],
  handleFilterChange,
  isChecked,
  handleClearAll,
}: {
  facets: Record<string, Record<string, number>>;
  suppliers?: Supplier[];
  categoriesData?: Category[];
  extrasData?: any[];
  handleFilterChange: (key: string, value: string, checked: boolean) => void;
  isChecked: (key: string, value: string) => boolean;
  handleClearAll: () => void;
}) {
  // Filter sections to only show those with available items
  const sections = [
    {
      title: "Categoria",
      filterKey: "cat",
      items: categoriesData.map((c) => ({
        id: c.id,
        name: (c as any).label || c.name,
      })),
    },
    {
      title: "Transmissão",
      filterKey: "trans",
      items: [
        { id: "automatico", name: "Automático" },
        { id: "manual", name: "Manual" },
      ],
    },
    {
      title: "Fornecedor",
      filterKey: "sup",
      items: suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        logo: s.logo,
      })),
    },
    {
      title: "Quilometragem",
      filterKey: "mileage",
      items: [
        { id: "limited", name: "Limitada" },
        { id: "unlimited", name: "Ilimitada" },
      ],
    },
    {
      title: "Preço por dia",
      filterKey: "price_range",
      items: [
        { id: "0-50000", name: "0 Kz - 50.000 Kz" },
        { id: "50000-100000", name: "50.000 Kz - 100.000 Kz" },
        { id: "100000-150000", name: "100.000 Kz - 150.000 Kz" },
        { id: "150000-200000", name: "150.000 Kz - 200.000 Kz" },
        { id: "200000+", name: "200.000 Kz +" },
      ],
    },
    {
      title: "Número de lugares",
      filterKey: "seats",
      items: [
        { id: "4", name: "4 lugares" },
        { id: "5", name: "5 lugares" },
        { id: "6+", name: "6+ lugares" },
      ],
    },
    {
      title: "Avaliação",
      filterKey: "score",
      items: [
        { id: "9", name: "Excelente: 9+" },
        { id: "8", name: "Muito bom: 8+" },
        { id: "7", name: "Bom: 7+" },
      ],
    },
    {
      title: "Quando pagar",
      filterKey: "pay",
      items: [
        { id: "now", name: "Pagar agora" },
        { id: "pickup", name: "Pagar na retirada" },
      ],
    },
    {
      title: "Extras",
      filterKey: "extras",
      items: extrasData.map((e) => ({
        id: e.id,
        name: e.name,
      })),
    },
  ];

  // Filter out sections with no items that have a count
  const visibleSections = sections.filter((section) => {
    return section.items.some((item) => (facets?.[section.filterKey]?.[item.id] ?? 0) > 0);
  });

  return (
    <div className="divide-y divide-gray-100 overflow-y-auto scrollbar-hide">
      {visibleSections.map((section) => (
        <FilterSection
          key={section.filterKey}
          title={section.title}
          filterKey={section.filterKey}
          facets={facets}
          isChecked={isChecked}
          handleFilterChange={handleFilterChange}
          items={section.items}
        />
      ))}

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
  <div className="p-2">
    <h3 className="font-bold text-sm text-gray-900 mb-2 text-[11px]">
      {title}
    </h3>
    <div className="space-y-2">
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

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";

export function FilterSidebar({
  facets,
  suppliers = [],
  categoriesData = [],
  extrasData = [],
}: {
  facets: Record<string, Record<string, number>>;
  suppliers?: Supplier[];
  categoriesData?: Category[];
  extrasData?: any[];
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
      "price_range",
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

  const activeFilterCount = [
    "cat", "trans", "sup", "mileage", "price_range", "seats", "score", "pay", "extras"
  ].reduce((acc, key) => acc + (searchParams.get(key)?.split(",").filter(Boolean).length || 0), 0);

  return (
    <>
      {/* Mobile Sticky Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 bg-[#003580] text-white px-6 py-3 rounded-full font-bold shadow-2xl transition-transform active:scale-95 border border-white/20">
              <Filter className="w-4 h-4 text-blue-200" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-[#003580] w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl border-t-0 bg-white">
            <SheetHeader className="p-4 border-b border-gray-100 flex-row items-center justify-between sticky top-0 bg-white z-10">
              <SheetTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                Filtrar Resultados
              </SheetTitle>
              <button
                onClick={handleClearAll}
                className="text-[#006ce4] text-xs font-bold hover:underline pr-8"
              >
                Limpar tudo
              </button>
            </SheetHeader>
            <div className="overflow-y-auto h-full pb-32">
              <FilterContent
                facets={facets}
                suppliers={suppliers}
                categoriesData={categoriesData}
                extrasData={extrasData}
                handleFilterChange={handleFilterChange}
                isChecked={isChecked}
                handleClearAll={handleClearAll}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:flex lg:sticky lg:top-[80px] h-fit max-h-[calc(100vh-80px)] flex-col">
        <div className="bg-white border-l border-gray-200 shadow-sm overflow-hidden flex flex-col h-full p-2.5">
          <div className="p-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900">
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
            categoriesData={categoriesData}
            extrasData={extrasData}
            handleFilterChange={handleFilterChange}
            isChecked={isChecked}
            handleClearAll={handleClearAll}
          />
        </div>
      </aside>
    </>
  );
}
