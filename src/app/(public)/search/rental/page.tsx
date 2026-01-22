import { SearchForm } from "@/components/search/form";
import { SearchPageContent } from "@/components/search/content";
import React, { Suspense } from "react";
import { searchCars, getSystemData } from "@/actions/public/search/cars";
import { SearchFilters, SearchResponse, SystemData } from "@/types";
import { getDraftAction } from "@/actions/public/drafts";

export default async function RentalSearchPage({
  searchParams,
}: { searchParams: Promise<{ s?: string; did?: string }> }) {
  let initialData: SearchFilters = {};
  let initialResults: SearchResponse | null = null;
  let initialSystemData: SystemData | null = null;

  const params = await searchParams;
  const draftId = params?.did;
  const s = params?.s;

  try {
    const sys = await getSystemData();
    initialSystemData = {
      ...sys,
      services: sys.services || []
    } as SystemData;
  } catch (e) {
    console.error(e);
  }

  // 1. Load filters from Search ID (Draft)
  if (draftId) {
    try {
      const draft = await getDraftAction(draftId) as any;
      if (draft) {
        initialData = draft.search || draft;
      }
    } catch (err) {
      console.warn("Failed to load draft in search page:", err);
    }
  }

  // Execute initial search (Removed per user request to only show results on manual click)
  /*
  try {
    initialData.type = "rental";
    const results = await searchCars(initialData);
    if (results && results.results) {
      initialResults = results;
    }
  } catch (e) {
    console.error("Server-side search failed in Rental Page:", e);
  }
  */

  initialData.type = "rental";

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="bg-[#003580] shadow-md pb-4 pt-4">
        <div className="container mx-auto px-4 relative z-50 flex flex-col gap-4">
          <SearchForm type="rental" initialData={initialData} />
        </div>
      </div>

      <div className="flex-grow relative">
        <main className="flex-grow relative">
          <Suspense fallback={<div className="py-12"><div className="container mx-auto px-4"><div className="animate-pulse bg-slate-100 h-6 w-48 mb-4" /></div></div>}>
            <SearchPageContent
              defaultType="rental"
              initialSearchData={initialData}
              initialResults={initialResults}
              initialSystemData={initialSystemData}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
