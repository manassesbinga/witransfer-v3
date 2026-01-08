import { SearchForm } from "@/components/search/form";
import { SearchPageContent } from "@/components/search/content";
import { decodeState } from "@/lib/url-state";
import { searchCars, getSystemData } from "@/actions/public/search/cars";

export default async function TransferSearchPage({
  searchParams,
}: { searchParams: Promise<{ s?: string }> }) {
  let initialData: any = {};
  let initialResults: any = null;
  let initialSystemData: any = null;

  const params = await searchParams;

  try {
    initialSystemData = await getSystemData();
  } catch (e) {
    console.error(e);
  }

  if (params && params.s) {
    const decoded = decodeState(params.s);
    if (decoded) {
      initialData = decoded;
      if (initialData.pickup) {
        try {
          initialData.type = "transfer";
          initialResults = await searchCars(initialData);
        } catch (e) {}
      }
    }
  }

  initialData.type = "transfer";

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="bg-[#003580] shadow-md pb-4 pt-4">
        <div className="container mx-auto px-4 relative z-50 flex flex-col gap-4">
          <SearchForm type="transfer" initialData={initialData} />
        </div>
      </div>

      <div className="flex-grow relative">
        <main className="flex-grow relative">
          <SearchPageContent
            defaultType="transfer"
            initialSearchData={initialData}
            initialResults={initialResults}
            initialSystemData={initialSystemData}
          />
        </main>
      </div>
    </div>
  );
}
