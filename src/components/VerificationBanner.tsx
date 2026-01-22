/** @format */

"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function VerificationBanner() {
    const router = useRouter();

    return (
        <motion.div
            {...({
                initial: { height: 0, opacity: 0 },
                animate: { height: "auto", opacity: 1 },
                className: "bg-amber-500 text-white overflow-hidden relative"
            } as any)}
        >
            <div className="max-w-[1400px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-black tracking-widest">
                        Verificação Pendente: Sua conta ainda não está validada pela nossa equipa.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/partners/settings/profile")}
                    className="flex items-center gap-2 bg-white text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest hover:bg-amber-50 transition-colors shrink-0 shadow-sm"
                >
                    <Upload className="w-3 h-3" />
                    Enviar Documentos
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
            {/* Animated bar at bottom */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-white/30 animate-[shimmer_2s_infinite]" />
        </motion.div>
    );
}
