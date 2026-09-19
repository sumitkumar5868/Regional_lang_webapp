// ============================================================
// LanguageSelector — configurable language dropdown
// ============================================================

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES, type LanguageOption } from "@/lib/config";

interface Props {
  value: string;
  onChange: (code: string) => void;
}

export default function LanguageSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const current: LanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === value) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass glass-hover flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-cyan-400" />
          <span className="text-slate-400">Language</span>
          <span className="text-white">{current.label}</span>
          <span className="text-cyan-300/80 text-xs">({current.nativeLabel})</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full glass rounded-xl p-1.5 fade-up overflow-hidden">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                lang.code === value
                  ? "bg-cyan-500/15 text-cyan-200"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="font-medium">{lang.label}</span>
                <span className="text-xs text-cyan-300/70">{lang.nativeLabel}</span>
              </span>
              {lang.code === value && <Check className="h-4 w-4 text-cyan-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
