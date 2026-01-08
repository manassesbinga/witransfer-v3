"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  inputClassName?: string;
  hideIcon?: boolean;
}

export function TimePicker({
  value,
  onChange,
  label,
  className,
  inputClassName,
  hideIcon = false,
}: TimePickerProps) {
  return (
    <div
      className={cn(
        !hideIcon &&
          "bg-white rounded-[2px] h-11 lg:h-13 flex items-center px-3 relative group focus-within:ring-2 focus-within:ring-[#1a73e8] focus-within:z-10 bg-clip-padding transition-colors hover:bg-gray-50",
        className,
      )}
    >
      {!hideIcon && (
        <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600 mr-2 lg:mr-3 flex-shrink-0" />
      )}
      <div className="flex flex-col flex-grow justify-center h-full">
        {label && (
          <label className="text-[9px] lg:text-[10px] text-gray-500 font-normal leading-none mb-0.5 whitespace-nowrap">
            {label}
          </label>
        )}
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full text-xs lg:text-sm font-semibold text-gray-900 outline-none bg-transparent leading-tight appearance-none",
            "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            inputClassName,
          )}
        />
      </div>
    </div>
  );
}
