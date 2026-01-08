"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchHeroProps {
  title: string;
  children: React.ReactNode;
  checkboxes: {
    label: string;
    defaultChecked?: boolean;
  }[];
}

export function SearchHero({ title, children, checkboxes }: SearchHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const animProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.24, ease: "easeOut" },
      };

  return (
    <motion.section
      {...animProps}
      className="relative min-h-[550px] md:min-h-[600px] flex items-start justify-center pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden bg-gradient-to-b from-[#003580] via-[#1a73e8] to-[#42a5f5]"
    >
      {/* Hero Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop&q=80"
          alt="Estrada em Angola"
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
        {/* Top Dark Overlay for Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#003580]/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-white w-full">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-center md:text-left drop-shadow-lg">
            {title}
          </h1>

          {/* Search Form Container - No Background */}
          <div className="w-full my-[10px] relative z-20">{children}</div>

          {/* Checkboxes - Outside the form container */}
          {checkboxes && checkboxes.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {checkboxes.map((cb, index) => (
                <div
                  key={index}
                  className="bg-white/15 backdrop-blur-[4px] px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <Checkbox
                      defaultChecked={cb.defaultChecked}
                      className="rounded border-none bg-white/20 data-[state=checked]:bg-white data-[state=checked]:text-[#1a73e8] flex-shrink-0 h-5 w-5"
                    />
                    <span className="text-sm text-white font-medium group-hover:text-white/90 transition-colors drop-shadow-md">
                      {cb.label}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
