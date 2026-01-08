/** @format */

import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* WiTransfer Symbol Animation */}
        <div className="relative group">
          {/* Outer Ring */}
          <div className="absolute -inset-4 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>

          {/* Logo Box */}
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 relative z-10 animate-bounce">
            <span className="text-white font-black text-4xl select-none">
              W
            </span>
          </div>

          {/* Subtle Glow */}
          <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-2xl animate-pulse"></div>
        </div>

        {/* Text Information */}
        <div className="text-center space-y-2 z-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            WiTransfer
          </h2>
          <div className="flex items-center gap-2 justify-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
