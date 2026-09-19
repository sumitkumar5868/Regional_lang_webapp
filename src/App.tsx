import { useCallback, useEffect, useState } from "react";
import { Eye, Hand, Sparkles, Zap } from "lucide-react";
import Header from "@/components/Header";
import AICamera from "@/components/AICamera";
import ResultPanel from "@/components/ResultPanel";
import LanguageSelector from "@/components/LanguageSelector";
import SessionHistory from "@/components/SessionHistory";
import HowItWorks from "@/components/HowItWorks";
import { DEFAULT_EMPTY_RESULT, type AIResult, type AIStatus } from "@/lib/api";
import { FRAME_INTERVAL } from "@/lib/config";
import {
  fetchRecentResults,
  saveResult,
  deleteResult,
  clearAllResults,
  type StoredResult,
} from "@/lib/resultsDb";

function App() {
  const [language, setLanguage] = useState("hi");
  const [realtime, setRealtime] = useState(false);
  const [result, setResult] = useState<AIResult>(DEFAULT_EMPTY_RESULT);
  const [status, setStatus] = useState<AIStatus>("Ready");
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [history, setHistory] = useState<StoredResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [retrySignal, setRetrySignal] = useState(0);

  const refreshHistory = useCallback(async () => {
    const items = await fetchRecentResults(12);
    setHistory(items);
    setHistoryLoading(false);
  }, []);

  const handleResult = useCallback(
    async (r: AIResult) => {
      setResult(r);
      setAnalyzing(false);
      if (r.text || r.gesture || r.emoji) {
        await saveResult(r, language);
        refreshHistory();
      }
    },
    [language, refreshHistory]
  );

  const handleStatus = useCallback((s: AIStatus) => {
    setStatus(s);
    setAnalyzing(s === "Analyzing" || s === "Understanding gesture" || s === "Generating response");
  }, []);

  const handleError = useCallback((msg: string | null) => setError(msg), []);

  const retry = () => {
    setError(null);
    setStatus("Ready");
    setRetrySignal((x) => x + 1);
  };

  // Load persisted history on mount.
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handleClearHistory = async () => {
    await clearAllResults();
    setHistory([]);
  };

  const handleDeleteItem = async (id: string) => {
    const ok = await deleteResult(id);
    if (ok) setHistory((h) => h.filter((it) => it.id !== id));
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="aurora bg-cyan-500 w-[480px] h-[480px] -top-32 -left-24" />
      <div className="aurora bg-violet-600 w-[520px] h-[520px] top-40 -right-24" />
      <div className="aurora bg-blue-600 w-[400px] h-[400px] bottom-0 left-1/3" />

      <div className="relative">
        <Header online={online} onStatus={setOnline} />

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 mb-6 fade-up">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs tracking-widest text-cyan-200">REGIONAL LANGUAGE MULTIMODAL AI</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white text-glow leading-tight fade-up" style={{ animationDelay: "0.05s" }}>
            See. Understand. <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">Communicate.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-300 fade-up" style={{ animationDelay: "0.1s" }}>
            Understand gestures and visual information through intelligent regional-language communication.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 fade-up" style={{ animationDelay: "0.15s" }}>
            <button
              onClick={() => document.getElementById("camera-app")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition"
            >
              <Eye className="h-4 w-4" /> Start AI Camera
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-medium text-slate-200 hover:text-cyan-300 transition"
            >
              <Hand className="h-4 w-4" /> How it works
            </a>
          </div>
        </section>

        {/* MAIN APP */}
        <section id="camera-app" className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="sm:w-72">
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <button
              onClick={() => setRealtime((r) => !r)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition ${
                realtime
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.3)]"
                  : "glass border-white/10 text-slate-300 hover:text-violet-300"
              }`}
            >
              <Zap className="h-4 w-4" />
              REAL-TIME AI
              <span className={`text-[10px] tracking-widest ${realtime ? "text-violet-300" : "text-slate-500"}`}>
                {realtime ? "ON" : "OFF"}
              </span>
            </button>
            {realtime && (
              <span className="text-xs text-slate-500">Interval: {FRAME_INTERVAL / 1000}s · throttled</span>
            )}
          </div>

          {/* Responsive layout: desktop side-by-side, tablet/mobile stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div key={`cam-${retrySignal}`}>
              <AICamera
                language={language}
                realtime={realtime}
                onResult={handleResult}
                onStatus={handleStatus}
                onError={handleError}
              />
              <div className="mt-6">
                <SessionHistory
                  items={history}
                  loading={historyLoading}
                  onClear={handleClearHistory}
                  onDelete={handleDeleteItem}
                />
              </div>
            </div>
            <ResultPanel result={result} status={status} error={error} analyzing={analyzing} onRetry={retry} />
          </div>
        </section>

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-xs text-slate-500">
            Regional Language Multimodal AI — Frontend integration layer. Connects to your existing AI backend.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
