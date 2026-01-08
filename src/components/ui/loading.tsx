"use client";

import { Car, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
  isVisible: boolean;
  message?: string;
  inline?: boolean;
}

export function Loading({
  isVisible,
  message = "Buscando os melhores preços...",
  inline,
}: LoadingProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "z-[100] flex items-center justify-center backdrop-blur-sm",
            inline
              ? "absolute inset-0 bg-white/95 rounded-[4px]"
              : "fixed inset-0 bg-black/60",
          )}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "flex flex-col items-center gap-4 text-center",
              !inline &&
                "bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4",
            )}
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <img
                  src="/logo.png"
                  alt="WiTransfer Logo"
                  className={cn(inline ? "h-6" : "h-12", "mx-auto")}
                />
              </motion.div>
              <div className="relative">
                <motion.div
                  animate={{ x: [-5, 5, -5], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[#1a73e8]"
                >
                  <Car className={cn(inline ? "h-10 w-10" : "h-16 w-16")} />
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -bottom-1 -right-1 text-[#ffb700]"
                >
                  <Loader2 className={cn(inline ? "h-5 w-5" : "h-8 w-8")} />
                </motion.div>
              </div>
            </div>

            <div className="space-y-1">
              <h3
                className={cn(
                  "font-bold text-gray-900",
                  inline ? "text-sm" : "text-xl",
                )}
              >
                {message}
              </h3>
              {!inline && (
                <p className="text-sm text-gray-500">
                  Isso levará apenas alguns segundos.
                </p>
              )}
              <div className="w-24 lg:w-32 bg-gray-100 h-1 rounded-full overflow-hidden mx-auto mt-2">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-full h-full bg-[#1a73e8]"
                />
              </div>
            </div>

            {!inline && (
              <div className="mt-8 pt-8 border-t border-gray-100 w-full">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">
                  Parceiros em Angola
                </p>
                <div className="flex flex-wrap justify-center gap-4 opacity-40 grayscale">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Hertz_logo.svg/2560px-Hertz_logo.svg.png"
                    className="h-4 object-contain"
                    alt="Hertz"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Avis_logo.svg/2560px-Avis_logo.svg.png"
                    className="h-4 object-contain"
                    alt="Avis"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Europcar_logo.svg/2560px-Europcar_logo.svg.png"
                    className="h-4 object-contain"
                    alt="Europcar"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Sixt_logo.svg/2560px-Sixt_logo.svg.png"
                    className="h-4 object-contain"
                    alt="Sixt"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
