// ============================================================
// Header — brand + backend status indicator + test connection
// ============================================================

import { useState } from "react";
import { Cpu, Radio, ShieldCheck } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

interface Props {
  online: boolean | null;
  onStatus: (v: boolean | null) => void;
}

export default function Header({ online, onStatus }: Props) {
  const [testing, setTesting] = useState(false);

  const test = async () => {
    setTesting(true);
    const ok = await checkBackendHealth();
    onStatus(ok);
    setTesting(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050814]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Cpu className="h-6 w-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400 live-dot" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-white">MULTIMODAL AI</div>
            <div className="text-[10px] tracking-widest text-cyan-300/70">REGIONAL VISION</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full glass px-3 py-1.5">
            <span className={`h-2 w-2 rounded-full ${online === true ? "bg-emerald-400" : online === false ? "bg-rose-500" : "bg-slate-500"}`} />
            <span className="text-xs text-slate-300">
              {online === true ? "AI Backend Connected" : online === false ? "AI Backend Offline" : "Backend Not Tested"}
            </span>
          </div>
          <button
            onClick={test}
            disabled={testing}
            className="flex items-center gap-2 rounded-lg glass px-3 py-1.5 text-xs text-slate-200 hover:text-cyan-300 transition disabled:opacity-50"
          >
            {testing ? <Radio className="h-3.5 w-3.5 animate-pulse" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            Test Connection
          </button>
        </div>
      </div>
    </header>
  );
}
