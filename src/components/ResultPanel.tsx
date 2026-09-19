// ============================================================
// ResultPanel — glassmorphism AI result display
// ============================================================

import { Activity, Languages, Sparkles, Type } from "lucide-react";
import ConfidenceRing from "./ConfidenceRing";
import AudioCard from "./AudioCard";
import type { AIResult, AIStatus } from "@/lib/api";

interface Props {
  result: AIResult;
  status: AIStatus;
  error: string | null;
  analyzing: boolean;
  onRetry: () => void;
}

const STATUS_COLOR: Record<AIStatus, string> = {
  Ready: "text-slate-400",
  Analyzing: "text-cyan-300",
  "Understanding gesture": "text-cyan-300",
  "Generating response": "text-violet-300",
  Complete: "text-emerald-400",
  "Backend unavailable": "text-rose-400",
  Error: "text-rose-400",
};

export default function ResultPanel({ result, status, error, analyzing, onRetry }: Props) {
  const hasResult = Boolean(result.text || result.gesture || result.emoji);
  const showSkeleton = analyzing && !hasResult;

  return (
    <div className="flex flex-col gap-5">
      {/* AI STATUS banner */}
      <div className="glass rounded-2xl px-5 py-3.5 flex items-center justify-between fade-up">
        <div className="flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="text-[10px] tracking-widest text-slate-500">AI STATUS</span>
          <span className={`text-sm font-semibold ${STATUS_COLOR[status]}`}>{status}</span>
        </div>
        {analyzing && <LoaderDots />}
      </div>

      {error && (
        <div className="glass rounded-2xl px-5 py-4 border-rose-500/30 fade-up">
          <p className="text-sm text-rose-300">{error}</p>
          <button
            onClick={onRetry}
            className="mt-3 rounded-lg bg-rose-500/15 px-4 py-2 text-xs font-semibold text-rose-200 border border-rose-500/30 hover:bg-rose-500/25 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top row: Gesture + Emoji + Confidence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Detected gesture + emoji */}
        <div className="glass rounded-2xl p-5 fade-up sm:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-[10px] tracking-widest text-slate-500">DETECTED GESTURE</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-6xl float-emoji select-none" aria-label="gesture emoji">
              {showSkeleton ? <SkeletonBox w={72} h={72} rounded /> : result.emoji || "—"}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-white">
                {showSkeleton ? <SkeletonLine w={140} /> : result.gesture || "Awaiting input"}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                {showSkeleton ? <SkeletonLine w={100} /> : result.translation || "—"}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] tracking-widest text-slate-500">STATUS</span>
                <span className={`text-xs font-semibold ${hasResult ? "text-emerald-400" : "text-slate-500"}`}>
                  {hasResult ? "Recognized" : "Idle"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence ring */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center fade-up">
          <ConfidenceRing value={result.confidence} />
        </div>
      </div>

      {/* Regional + Translation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5 fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Type className="h-4 w-4 text-cyan-400" />
            <span className="text-[10px] tracking-widest text-slate-500">REGIONAL LANGUAGE</span>
          </div>
          {showSkeleton ? (
            <SkeletonLine w={180} h={28} />
          ) : (
            <p className="text-3xl font-bold text-white text-glow leading-tight" lang="hi">
              {result.text || "—"}
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-5 fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Languages className="h-4 w-4 text-violet-400" />
            <span className="text-[10px] tracking-widest text-slate-500">TRANSLATION</span>
          </div>
          {showSkeleton ? (
            <SkeletonLine w={160} h={28} />
          ) : (
            <p className="text-2xl font-semibold text-slate-200 leading-tight">
              {result.translation || "—"}
            </p>
          )}
        </div>
      </div>

      {/* Gesture detail card */}
      <div className="glass rounded-2xl p-5 fade-up">
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="GESTURE" value={showSkeleton ? "" : result.gesture || "—"} />
          <Stat label="STATUS" value={hasResult ? "Recognized" : "Idle"} accent={hasResult ? "emerald" : "slate"} />
          <Stat label="CONFIDENCE" value={showSkeleton ? "" : `${Math.round(result.confidence * 100)}%`} />
        </div>
        {/* Reserved area for future hand-landmark visualization */}
        <div className="mt-4 rounded-xl border border-dashed border-slate-700/60 p-4 text-center text-xs text-slate-600">
          Hand-landmark visualization area (populated when backend returns coordinates)
        </div>
      </div>

      {/* Audio output */}
      <AudioCard audioUrl={result.audio} active={analyzing} />
    </div>
  );
}

// ---- small helpers ----
function Stat({ label, value, accent = "cyan" }: { label: string; value: string; accent?: "cyan" | "emerald" | "slate" }) {
  const color = accent === "emerald" ? "text-emerald-400" : accent === "slate" ? "text-slate-400" : "text-cyan-300";
  return (
    <div>
      <div className="text-[10px] tracking-widest text-slate-500 mb-1">{label}</div>
      <div className={`text-base font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function LoaderDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-cyan-400 live-dot" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

function SkeletonLine({ w = 120, h = 18 }: { w?: number; h?: number }) {
  return <div className="shimmer rounded-md" style={{ width: w, height: h }} />;
}
function SkeletonBox({ w, h, rounded }: { w: number; h: number; rounded?: boolean }) {
  return <div className={`shimmer ${rounded ? "rounded-2xl" : "rounded-md"}`} style={{ width: w, height: h }} />;
}
