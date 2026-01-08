"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
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

import { encodeState, decodeState } from "@/lib/url-state";
// local state

interface SearchFormProps {
  type: "rental" | "transfer";
  initialData?: any;
}

export function SearchForm({ type, initialData }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // Decodifica o estado da URL se existir
  const getDecodedState = () => {
    const s = searchParams.get("s");
    if (s) return decodeState(s);

    const sid = searchParams.get("sid");
    if (sid) {
      try {
        const stored = sessionStorage.getItem(sid);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  };

  const decodedState = getDecodedState();
  const mergedData = { ...decodedState, ...initialData };

  // Helper to get value from Initial Data OR URL (fallback)
  const getValue = (key: string, defaultVal: string = "") => {
    if (mergedData && mergedData[key]) return mergedData[key];
    return searchParams.get(key) || defaultVal;
  };

  const [pickup, setPickup] = useState(getValue("pickup", ""));
  const [dropoff, setDropoff] = useState(getValue("dropoff", ""));

  // Tenta ler datas da URL ou usa valores padrão
  const getInitialDate = (key: string, daysOffset = 0) => {
    const val = getValue(key);
    if (val) return new Date(val);
    return new Date(Date.now() + daysOffset * 86400000);
  };

  const [date1, setDate1] = useState<Date>(getInitialDate("from", 0));
  const [date2, setDate2] = useState<Date>(getInitialDate("to", 3));
  const [time1, setTime1] = useState(getValue("time1", "12:00"));
  const [time2, setTime2] = useState(getValue("time2", "12:00"));

  const [passengers, setPassengers] = useState(getValue("passengers", "1"));
  const [luggage, setLuggage] = useState(getValue("luggage", "1"));
  const [isLoading, setIsLoading] = useState(false);

  // Track if current orientation/destination values were actual selections (Real Locations)
  const [isPickupValid, setIsPickupValid] = useState(!!getValue("pickup"));
  const [isDropoffValid, setIsDropoffValid] = useState(
    type === "transfer" ? !!getValue("dropoff") : true,
  );

  // Reset loading state when search params change (navigation complete)
  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  const handleSearch = async () => {
    // Validação Rígida - Toast Notification
    if (type === "transfer") {
      if (!pickup?.trim()) {
        toast.error("Por favor, informe o local de partida.", {
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
        toast.error("Por favor, informe o destino da viagem.", {
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
        toast.error("Selecione a data da viagem.", {
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
        toast.error("Informe o número de passageiros.", {
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
        toast.error("Informe o local de retirada do veículo.", {
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
        toast.error("Selecione as datas de início e fim.", {
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
      toast.error(
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
      setIsLoading(false);
      return;
    }

    if (type === "transfer" && !isDropoffValid) {
      toast.error(
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
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // The state object matches the data structure mostly.
    // We ensure date strings are ISO for the server/json.
    const searchState: any = {
      pickup,
      dropoff,
      from: date1?.toISOString(),
      type,
    };

    if (type === "rental") {
      searchState.to = date2?.toISOString();
      searchState.time1 = time1;
      searchState.time2 = time2;
    } else {
      searchState.time = time1; // or time1 renamed
      searchState.time1 = time1;
      searchState.passengers = passengers;
      searchState.luggage = luggage;
    }

    try {
      // Prefer embedding compressed state into URL for portability.
      const encoded = encodeState(searchState);

      // If encoded string is short enough for URL (conservative limit), use it
      if (encoded && encoded.length < 1900) {
        const params = new URLSearchParams();
        params.set("s", encoded);
        router.push(`/search/${type}?${params.toString()}`);
        return;
      }

      // Fallback: store in sessionStorage and reference by sid
      try {
        const sid = `ws_state_${Date.now().toString(36)}_${Math.floor(Math.random() * 10000)}`;
        sessionStorage.setItem(sid, JSON.stringify(searchState));
        const params = new URLSearchParams();
        params.set("sid", sid);
        router.push(`/search/${type}?${params.toString()}`);
        return;
      } catch (e) {
        console.error("Failed to store state in sessionStorage", e);
        toast.error("Não foi possível salvar o estado da pesquisa.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar pesquisa.");
      setIsLoading(false);
    }
  };

  const DateInput = ({ label, value, onChange, disabled }: any) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!value}
            className={cn(
              "w-full lg:w-[150px] h-11 lg:h-13 px-3 justify-start text-left font-normal bg-white hover:bg-gray-50 border-gray-300",
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
    <div className="w-full lg:w-[100px] bg-white h-11 lg:h-13 px-3 flex flex-col justify-center rounded-[2px] border-l border-gray-200 transition-colors hover:bg-gray-50">
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
          "w-full bg-white rounded-lg shadow-lg border border-gray-300 min-h-[80px] lg:h-[80px] flex flex-wrap lg:flex-nowrap items-center justify-center px-2 sm:px-4 py-3 lg:py-0 gap-2 sm:gap-3 lg:gap-4 overflow-visible",
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
        className="w-full lg:w-[110px] border border-gray-300"
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
        onClick={handleSearch}
        loading={isLoading}
        className="h-11 lg:h-13 px-8 bg-[#008009] hover:bg-[#006607] text-white font-bold rounded-[2px] border border-gray-300 transition-transform hover:scale-[1.02] flex-shrink-0"
      >
        Pesquisar
      </Button>
    </motion.div>
  );
}
