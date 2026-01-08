"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Navigation, Car } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchLayoutNav() {
  const pathname = usePathname();
  const router = useRouter();

  const searchParams = useSearchParams();

  // Determine active tab using pathname first, then fallback to `type` search param.
  // This avoids marking 'Aluguel' as active on generic `/search` routes.
  const typeParam = searchParams.get("type");

  // Compute initial active based on path/param
  let initial: "rental" | "transfer" = "rental";
  if (pathname.includes("/transfer")) initial = "transfer";
  else if (pathname.includes("/rental")) initial = "rental";
  else if (typeParam === "transfer") initial = "transfer";
  else if (typeParam === "rental") initial = "rental";

  // Keep a local active state so UI updates immediately on click
  const [activeState, setActiveState] = useState<"rental" | "transfer">(
    initial,
  );

  // Sync local state when pathname or type param changes externally
  useEffect(() => {
    let newActive: "rental" | "transfer" = "rental";
    if (pathname.includes("/transfer")) newActive = "transfer";
    else if (pathname.includes("/rental")) newActive = "rental";
    else if (typeParam === "transfer") newActive = "transfer";
    else if (typeParam === "rental") newActive = "rental";
    setActiveState(newActive);
  }, [pathname, typeParam]);

  const isTransfer = activeState === "transfer";
  const isRental = activeState === "rental";

  return (
    <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
      <button
        type="button"
        aria-pressed={isRental}
        onClick={() => router.push(`${pathname}?type=rental`)}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-full transition-all focus:outline-none focus:ring-0",
          isRental
            ? "border border-white text-white bg-transparent"
            : "text-white/90 hover:text-white",
        )}
      >
        <Car className="h-4 w-4" />
        <span className="text-sm font-bold">Aluguel</span>
      </button>

      <button
        type="button"
        aria-pressed={isTransfer}
        onClick={() => router.push(`${pathname}?type=transfer`)}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-full transition-all focus:outline-none focus:ring-0",
          isTransfer
            ? "border border-white text-white bg-transparent"
            : "text-white/90 hover:text-white",
        )}
      >
        <Navigation className="h-4 w-4" />
        <span className="text-sm font-bold">Viagens</span>
      </button>
    </nav>
  );
}
