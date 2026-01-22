import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50/50 flex flex-col items-center justify-center gap-6">
      <Loader2 className="h-10 w-10 animate-spin text-[#003580]" />
      <p className="text-xs font-black tracking-[0.3em] text-slate-400">
        Preparando histórico...
      </p>
    </div>
  );
}
