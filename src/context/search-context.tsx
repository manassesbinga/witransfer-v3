"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface SearchState {
  pickup: string;
  dropoff: string;
  from: Date | undefined;
  to: Date | undefined;
  time1: string;
  time2: string;
  type: "rental" | "transfer";
  passengers: string;
  luggage: string; // stored as string for input
}

interface SearchContextType {
  data: SearchState;
  setData: (data: Partial<SearchState>) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

const defaultState: SearchState = {
  pickup: "Aeroporto Internacional Quatro de Fevereiro, Luanda, Angola",
  dropoff: "",
  from: undefined,
  to: undefined,
  time1: "12:00",
  time2: "12:00",
  type: "rental",
  passengers: "1",
  luggage: "1",
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: any;
}) {
  const [data, _setData] = useState<SearchState>({
    ...defaultState,
    ...initialData,
    // Ensure Dates are Date objects if passed as strings
    from: initialData?.from ? new Date(initialData.from) : undefined,
    to: initialData?.to ? new Date(initialData.to) : undefined,
  });

  const [isLoading, setIsLoading] = useState(false);

  const setData = (newData: Partial<SearchState>) => {
    _setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <SearchContext.Provider value={{ data, setData, isLoading, setIsLoading }}>
      <Suspense fallback={null}>
        <SearchSync onSync={(type) => {
          if (data.type !== type) {
            _setData((prev) => ({ ...prev, type: type as "rental" | "transfer" }));
          }
        }} />
      </Suspense>
      {children}
    </SearchContext.Provider>
  );
}

function SearchSync({ onSync }: { onSync: (type: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && (typeParam === "rental" || typeParam === "transfer")) {
      onSync(typeParam);
    }
  }, [searchParams, onSync]);
  return null;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
