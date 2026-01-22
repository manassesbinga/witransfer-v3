"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { toast } from "sonner";

import { createDraftAction } from "@/actions/public/drafts";
import { SearchFilters } from "@/types";
// local state

interface SearchFormProps {
  type: "rental" | "transfer";
  initialData?: SearchFilters;
}

export function SearchForm({ type, initialData }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // No longer read compressed state from URL or sessionStorage; we rely
  // on server-side drafts (`did`) to pass search state between pages.
  const getDecodedState = () => null;

  const mergedData = { ...(initialData || {}) };

  // Helper to get value from Initial Data OR URL (fallback)
  const getValue = (key: keyof SearchFilters, defaultVal: string = "") => {
    if (mergedData && mergedData[key]) return String(mergedData[key]);
    return searchParams.get(key) || defaultVal;
  };

  const [pickup, setPickup] = useState(getValue("pickup" as keyof SearchFilters, ""));
  const [dropoff, setDropoff] = useState(getValue("dropoff" as keyof SearchFilters, ""));

  // Tenta ler datas da URL ou usa valores padrão
  const getInitialDate = (key: keyof SearchFilters, daysOffset = 0) => {
    const val = getValue(key);
    if (val) return new Date(val);
    return new Date(Date.now() + daysOffset * 86400000);
  };

  const [date1, setDate1] = useState<Date>(getInitialDate("from" as keyof SearchFilters, 0));
  const [date2, setDate2] = useState<Date>(getInitialDate("to" as keyof SearchFilters, 3));
  const [time1, setTime1] = useState(getValue("time1" as keyof SearchFilters, "12:00"));
  const [time2, setTime2] = useState(getValue("time2" as keyof SearchFilters, "12:00"));

  const [passengers, setPassengers] = useState(getValue("passengers" as keyof SearchFilters, "1"));
  const [luggage, setLuggage] = useState(getValue("luggage" as keyof SearchFilters, "1"));
  const [isLoading, setIsLoading] = useState(false);

  // Track if current orientation/destination values were actual selections (Real Locations)
  const [isPickupValid, setIsPickupValid] = useState(!!getValue("pickup"));
  const [isDropoffValid, setIsDropoffValid] = useState(
    type === "transfer" ? !!getValue("dropoff") : true,
  );

  // Save state to sessionStorage for persistence
  useEffect(() => {
    const searchState = {
      pickup,
      dropoff,
      from: date1?.toISOString(),
      to: date2?.toISOString(),
      time1,
      time2,
      time: time1, // legacy/compatibility
      passengers,
      luggage,
      type,
    };
    try {
      sessionStorage.setItem("witransfer_last_search", JSON.stringify(searchState));
    } catch (e) {
      // Ignore
    }
  }, [pickup, dropoff, date1, date2, time1, time2, passengers, luggage, type]);

  // Restore state from sessionStorage (draft) when the component mounts.
  useEffect(() => {
    try {
      const did = searchParams.get("did");
      const saved = did ? sessionStorage.getItem(did) : null;
      const fallback = sessionStorage.getItem("witransfer_last_search");
      const json = saved || fallback;
      if (json) {
        const s = JSON.parse(json);
        // Handle nested search object if from a draft
        const data = s.search || s;

        if (data.pickup) setPickup(data.pickup);
        if (data.dropoff) setDropoff(data.dropoff);
        if (data.from) setDate1(new Date(data.from));
        if (data.to) setDate2(new Date(data.to));
        if (data.time1) setTime1(data.time1);
        if (data.time2) setTime2(data.time2);
        if (data.time && !data.time1) setTime1(data.time);
        if (data.passengers) setPassengers(String(data.passengers));
        if (data.luggage) setLuggage(String(data.luggage));
        setIsPickupValid(!!data.pickup);
        setIsDropoffValid(type === "transfer" ? !!data.dropoff : true);
      }
    } catch (e) {
      // Ignore parsing errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset loading state when search params change (navigation complete)
  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  const handleSearch = async (silent = false) => {
    // Validação Rígida - Toast Notification
    if (type === "transfer") {
      if (!pickup?.trim()) {
        if (!silent) toast.error("Por favor, informe o local de partida.", {
          duration: 3000,
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #f87171",
          },
        });
        return;
      }
      if (!dropoff?.trim()) {
        if (!silent) toast.error("Por favor, informe o destino da viagem.", {
          duration: 3000,
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #f87171",
          },
        });
        return;
      }
      if (!date1) {
        if (!silent) toast.error("Selecione a data da viagem.", {
          duration: 3000,
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #f87171",
          },
        });
        return;
      }
      if (!passengers || parseInt(passengers) < 1) {
        if (!silent) toast.error("Informe o número de passageiros.", {
          duration: 3000,
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #f87171",
          },
        });
        return;
      }
    } else {
      // Rental Validation
      if (!pickup?.trim()) {
        if (!silent) toast.error("Informe o local de retirada do veículo.", {
          duration: 3000,
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #f87171",
          },
        });
        return;
      }
      if (!date1 || !date2) {
        if (!silent) toast.error("Selecione as datas de início e fim.", {
          duration: 3000,
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #f87171",
          },
        });
        return;
      }
    }

    // Validação de Localizações Reais
    if (!isPickupValid) {
      if (!silent) toast.error(
        "Por favor, selecione um local de partida real da lista de sugestões.",
        {
          duration: 4000,
          style: {
            background: "#fffbeb",
            color: "#92400e",
            border: "1px solid #fcd34d",
          },
        },
      );
      if (!silent) setIsLoading(false);
      return;
    }

    if (type === "transfer" && !isDropoffValid) {
      if (!silent) toast.error(
        "Por favor, selecione um destino real da lista de sugestões.",
        {
          duration: 4000,
          style: {
            background: "#fffbeb",
            color: "#92400e",
            border: "1px solid #fcd34d",
          },
        },
      );
      if (!silent) setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);

    const mergeDateTime = (date: Date, timeStr: string) => {
      if (!date || !timeStr) return date;
      const [hours, minutes] = timeStr.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    };

    const searchState: any = {
      pickup,
      dropoff,
      from: mergeDateTime(date1, time1).toISOString(),
      type,
    };

    if (type === "rental") {
      searchState.to = mergeDateTime(date2, time2).toISOString();
      searchState.time1 = time1;
      searchState.time2 = time2;
    } else {
      searchState.time = time1;
      searchState.time1 = time1;
      searchState.passengers = passengers;
      searchState.luggage = luggage;
    }

    try {
      // 1. Save search state server-side (generate ID) with nested structure for draft
      const draftPayload = {
        search: searchState,
        type: type,
      };
      const result = await createDraftAction(draftPayload);
      const draftId = result?.id || `draft_${Date.now()}`;

      // 2. Save locally in sessionStorage for fast retrieval
      try {
        // Save the nested draft structure under the draft ID
        sessionStorage.setItem(draftId, JSON.stringify(draftPayload));
        // Also save flat search state for quick access (read-only reference)
        sessionStorage.setItem("witransfer_last_search", JSON.stringify(searchState));
        // Remember last draft id so other pages can reuse it
        sessionStorage.setItem("witransfer_last_did", draftId);

        // TRIGGER FLAG: Mark that search was explicitly clicked
        sessionStorage.setItem("witransfer_trigger_search", "true");
        window.dispatchEvent(new Event("search-triggered"));
      } catch (e) {
        console.warn("Failed to save search to sessionStorage:", e);
      }

      const params = new URLSearchParams();
      params.set("did", draftId);
      router.push(`/search/${type}?${params.toString()}`);
      return;
    } catch (err) {
      console.error(err);
      if (!silent) toast.error("Erro inesperado ao processar pesquisa.");
      setIsLoading(false);
    }
  };

  // Auto-Search Effect
  useEffect(() => {
    // Only auto-search if on a results page
    const isResultsPage = pathname.startsWith("/search");
    if (!isResultsPage) return;

    // Debounce to avoid constant refreshing
    const timer = setTimeout(() => {
      // Construct current state key to compare with last search
      const mergeDateTime = (date: Date, timeStr: string) => {
        if (!date || !timeStr) return date;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
      };

      const currentState: any = {
        pickup,
        dropoff,
        from: mergeDateTime(date1, time1)?.toISOString(),
        type,
      };

      if (type === "rental") {
        currentState.to = mergeDateTime(date2, time2)?.toISOString();
        currentState.time1 = time1;
        currentState.time2 = time2;
      } else {
        currentState.time = time1;
        currentState.time1 = time1;
        currentState.passengers = passengers;
        currentState.luggage = luggage;
      }

      const lastSearchJson = sessionStorage.getItem("witransfer_last_search");
      if (lastSearchJson) {
        const lastSearch = JSON.parse(lastSearchJson);
        // Deep compare roughly works for this flat-ish object, but simpler check is stringify
        // Note: we need to ensure key order matches, or just assume the structure is stable enough.
        // Or simpler: check if critical fields differ.
        const currentStr = JSON.stringify(currentState);
        const lastStr = JSON.stringify(lastSearch);

        // Ideally we normalize dates before stringify, but let's assume getISOString is consistent.
        if (currentStr !== lastStr) {
          handleSearch(true); // Silent mode
        }
      }
    }, 1200); // 1.2s delay to wait for typing to finish

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, dropoff, date1, date2, time1, time2, passengers, luggage, type, isPickupValid, isDropoffValid, pathname]);

  const DateInput = ({ label, value, onChange, disabled }: any) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!value}
            className={cn(
              "w-full lg:w-[150px] h-11 lg:h-13 px-3 justify-start text-left font-normal bg-white hover:bg-gray-50 border-0 rounded-none",
              "data-[empty=true]:text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
            <div className="flex flex-col min-w-0">
              <label className="text-[9px] lg:text-[10px] text-gray-500 font-normal leading-none mb-0.5 whitespace-nowrap">
                {label}
              </label>
              <span className="text-xs lg:text-sm font-semibold text-gray-900 truncate">
                {value
                  ? format(value, "eee, dd MMM", { locale: ptBR })
                  : "Selecionar"}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            fromYear={2024}
            toYear={2030}
            onSelect={(d) => {
              if (d) {
                onChange(d);
                setOpen(false);
              }
            }}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  const NumberInput = ({
    label,
    value,
    onChange,
    icon: Icon,
    min,
    max,
  }: any) => (
    <div className="w-full lg:w-[100px] bg-white h-11 lg:h-13 px-3 flex flex-col justify-center rounded-[2px] border-0 transition-colors hover:bg-gray-50">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <label className="text-[9px] lg:text-[10px] text-gray-500 font-normal leading-none mb-0.5 whitespace-nowrap">
            {label}
          </label>
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent p-0 border-none text-xs lg:text-sm font-semibold text-gray-900 focus:outline-none h-auto leading-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      {...({
        initial: prefersReducedMotion ? undefined : { opacity: 0, y: 6 },
        animate: prefersReducedMotion ? undefined : { opacity: 1, y: 0 },
        exit: prefersReducedMotion ? undefined : { opacity: 0, y: -6 },
        transition: prefersReducedMotion
          ? undefined
          : { duration: 0.16, ease: "easeOut" },
        layout: !prefersReducedMotion,
        className:
          "w-full bg-white rounded-none shadow-lg border border-gray-300 min-h-[80px] lg:h-[80px] flex flex-wrap lg:flex-nowrap items-center justify-center px-2 sm:px-4 py-3 lg:py-0 gap-2 sm:gap-3 lg:gap-4 overflow-visible",
        style: { willChange: "transform, opacity" },
      } as any)}
    >
      <LocationAutocomplete
        label={type === "rental" ? "Local de retirada" : "De onde?"}
        icon={type === "rental" ? undefined : MapPin}
        color={type === "transfer" ? "text-green-600" : "text-gray-600"}
        value={pickup}
        onChange={(v) => {
          setPickup(v);
          setIsPickupValid(false);
        }}
        onSelect={() => setIsPickupValid(true)}
        placeholder={
          type === "rental"
            ? "Cidade, aeroporto de Angola..."
            : "Ponto de partida"
        }
        className="flex-grow min-w-0"
        inputClassName="bg-white h-11 lg:h-13 border border-gray-300"
        showMap={type === "transfer"}
      />

      {type === "transfer" && (
        <LocationAutocomplete
          label="Para onde?"
          icon={MapPin}
          color="text-red-600"
          value={dropoff}
          onChange={(v) => {
            setDropoff(v);
            setIsDropoffValid(false);
          }}
          onSelect={() => setIsDropoffValid(true)}
          placeholder="Ponto de destino"
          className="flex-grow min-w-0"
          inputClassName="bg-white h-11 lg:h-13 border border-gray-300"
          showMap={true}
        />
      )}

      <DateInput
        label={type === "rental" ? "Data de retirada" : "Quando?"}
        value={date1}
        onChange={(d: Date) => {
          setDate1(d);
          if (date2 < d) setDate2(d);
        }}
        disabled={(d: Date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return d < today;
        }}
      />

      <TimePicker
        value={time1}
        onChange={setTime1}
        label="Hora"
        className="w-full lg:w-[110px] border border-gray-300 rounded-none"
      />

      {type === "rental" && (
        <>
          <DateInput
            label="Data de devolução"
            value={date2}
            onChange={setDate2}
            disabled={(d: Date) => {
              const d1 = date1 ? new Date(date1) : new Date();
              d1.setHours(0, 0, 0, 0);
              return d < d1;
            }}
          />
          <TimePicker
            value={time2}
            onChange={setTime2}
            label="Hora"
            className="w-full lg:w-[110px] border border-gray-300"
          />
        </>
      )}

      {type === "transfer" && (
        <>
          <NumberInput
            label="Passageiros"
            value={passengers}
            onChange={setPassengers}
            icon={Users}
            min={1}
            max={8}
          />
          <NumberInput
            label="Malas"
            value={luggage}
            onChange={setLuggage}
            icon={Briefcase}
            min={0}
            max={6}
          />
        </>
      )}

      <Button
        onClick={() => handleSearch(false)}
        loading={isLoading}
        className="h-11 lg:h-13 px-8 bg-[#008009] hover:bg-[#006607] text-white font-bold rounded-none border border-gray-300 transition-transform hover:scale-[1.02] flex-shrink-0"
      >
        Pesquisar
      </Button>
    </motion.div>
  );
}
