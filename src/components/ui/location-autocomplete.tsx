"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalitySuggestions } from "@/actions/public/locations";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  icon?: any;
  color?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  dark?: boolean;
  onSelect?: (value: string) => void;
}

export function LocationAutocomplete({
  value,
  onChange,
  label,
  placeholder,
  icon: Icon = Search,
  color = "text-gray-400",
  className,
  inputClassName,
  labelClassName,
  dark = false,
  onSelect,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.length >= 2) {
        setLoading(true);
        // Track request id to ignore out-of-order responses
        requestIdRef.current = (requestIdRef.current || 0) + 1;
        const currentRequest = requestIdRef.current;
        try {
          const results = await getLocalitySuggestions(value);
          // Only set suggestions if this response is the most recent
          if (currentRequest === requestIdRef.current) {
            setSuggestions(results);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [value]);

  const handleInputChange = (val: string) => {
    onChange(val);
    if (val.length >= 2) {
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative group">
        <div
          className={cn(
            "flex items-center gap-2 lg:gap-3 px-3 rounded-[2px] transition-all",
            inputClassName || "bg-white h-11",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0",
              color || "text-gray-400",
            )}
          />
          <div className="flex flex-col flex-grow justify-center min-w-0 h-full">
            {label && (
              <label
                className={cn(
                  "text-[9px] lg:text-[10px] font-normal leading-none mb-0.5 whitespace-nowrap",
                  labelClassName || (dark ? "text-gray-500" : "text-gray-500"),
                )}
              >
                {label}
              </label>
            )}
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => value.length >= 2 && setIsOpen(true)}
              placeholder={placeholder}
              className="w-full bg-transparent outline-none text-xs lg:text-sm font-semibold text-gray-900 placeholder:text-gray-400 truncate leading-tight"
            />
          </div>
          <div className="flex items-center gap-1">
            {loading && (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            )}
            {value && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onChange("");
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[2px] shadow-2xl border border-gray-100 z-[9999] max-h-80 overflow-y-auto outline-none">
            <div className="py-1">
              {suggestions.map((loc, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    onChange(loc);
                    if (onSelect) onSelect(loc);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group text-left"
                >
                  <MapPin className="h-4 w-4 text-gray-400 group-hover:text-[#1a73e8] mt-0.5 flex-shrink-0" />
                  <span className="text-xs lg:text-sm text-gray-700 font-medium leading-relaxed block">
                    {loc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
