"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // O botão aparece apenas após rolar 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
              "bg-[#003580] hover:bg-[#002b66] text-white",
              "flex items-center justify-center border-4 border-white",
              "hover:scale-110 active:scale-95 group",
            )}
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="h-7 w-7 group-hover:-translate-y-1 transition-transform duration-300" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
