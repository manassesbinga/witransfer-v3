import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="h-[80vh] w-full flex flex-col items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-6">
        {/* WiTransfer Symbol Animation */}
        <div className="relative group">
          {/* Outer Ring */}
          <div className="absolute -inset-4 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
          
          {/* Logo Box */}
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 relative z-10 animate-pulse">
            <span className="text-white font-black text-4xl select-none">W</span>
          </div>
          
          {/* Subtle Glow */}
          <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-xl animate-pulse"></div>
        </div>
        
        {/* Text Information */}
        <div className="text-center space-y-1 z-10 mt-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">WiTransfer</h2>
          <div className="flex items-center gap-2 justify-center text-slate-400 font-bold text-[10px] tracking-[0.2em] ml-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processando Requisição</span>
          </div>
        </div>
      </div>
    </div>
  );
}
