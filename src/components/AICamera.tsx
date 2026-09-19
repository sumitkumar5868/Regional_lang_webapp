// ============================================================
// AICamera — Framer Code Component
// Handles camera init, permission, capture, API + real-time AI.
// Camera APIs are only accessed inside effects/handlers.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Camera,
  CameraOff,
  Eye,
  Loader2,
  RefreshCw,
  Repeat,
  Zap,
} from "lucide-react";
import { useCamera } from "@/lib/useCamera";
import { sendFrameToBackend, type AIResult, type AIStatus } from "@/lib/api";
import { FRAME_INTERVAL } from "@/lib/config";

interface Props {
  language: string;
  realtime: boolean;
  onResult: (r: AIResult) => void;
  onStatus: (s: AIStatus) => void;
  onError: (msg: string | null) => void;
}

export default function AICamera({ language, realtime, onResult, onStatus, onError }: Props) {
  const { videoRef, state, start, stop, switchCamera, captureFrame } = useCamera();
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const processingRef = useRef(false);
  const rtTimerRef = useRef<number | null>(null);

  // ---- Core analysis routine (shared by manual + real-time) ----
  const analyze = useCallback(
    async (image: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setAnalyzing(true);
      onStatus("Analyzing");
      try {
        onStatus("Understanding gesture");
        const result = await sendFrameToBackend(image, language);
        onStatus("Generating response");
        onResult(result);
        onStatus("Complete");
        onError(null);
      } catch (err) {
        const e = err as { kind?: string; message?: string };
        if (e?.kind === "backend" || e?.kind === "network") onStatus("Backend unavailable");
        else onStatus("Error");
        onError(e?.message ?? "Something went wrong.");
      } finally {
        setAnalyzing(false);
        processingRef.current = false;
      }
    },
    [language, onResult, onStatus, onError]
  );

  // ---- Manual capture flow ----
  const handleCapture = () => {
    const img = captureFrame();
    if (!img) return;
    setPreview(img);
    stop();
  };

  const handleRetake = () => {
    setPreview(null);
    start();
  };

  const handleAnalyze = () => {
    if (preview) analyze(preview);
  };

  // ---- Real-time AI loop ----
  useEffect(() => {
    if (!realtime || !state.active) {
      if (rtTimerRef.current) {
        clearInterval(rtTimerRef.current);
        rtTimerRef.current = null;
      }
      return;
    }
    rtTimerRef.current = window.setInterval(() => {
      const img = captureFrame();
      if (img && !processingRef.current) analyze(img);
    }, FRAME_INTERVAL);
    return () => {
      if (rtTimerRef.current) clearInterval(rtTimerRef.current);
      rtTimerRef.current = null;
    };
  }, [realtime, state.active, captureFrame, analyze]);

  // ---- Auto-start camera when toggled on via parent ----
  // (No auto-start here — user presses Start to grant permission.)

  return (
    <div className="glass rounded-3xl p-4 sm:p-5 fade-up">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">AI VISION CAMERA</h3>
        </div>
        {state.active && (
          <div className="flex items-center gap-2 text-xs text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 live-dot" />
            <span className="tracking-widest font-semibold">LIVE</span>
          </div>
        )}
      </div>

      {/* Viewport */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/60 border border-cyan-500/15">
        {/* Live video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 h-full w-full object-cover ${state.active ? "opacity-100" : "opacity-0"} ${state.facingMode === "user" ? "-scale-x-100" : ""}`}
        />

        {/* Captured preview */}
        {preview && (
          <img src={preview} alt="Captured frame" className="absolute inset-0 h-full w-full object-cover" />
        )}

        {/* Idle / permission state */}
        {!state.active && !preview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="relative">
              <Camera className="h-14 w-14 text-cyan-400/70" />
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 pulse-ring" />
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              {state.starting ? "Requesting camera access…" : "Start the camera to begin visual capture."}
            </p>
            {state.error && <p className="text-xs text-rose-400 max-w-xs">{state.error}</p>}
            {!state.supported && (
              <p className="text-xs text-amber-400/80 max-w-xs">
                Camera requires HTTPS or localhost. This page may be served over HTTP.
              </p>
            )}
          </div>
        )}

        {/* HUD corners + scanline */}
        {state.active && !preview && (
          <>
            <div className="hud-corner top-3 left-3 border-l-2 border-t-2 rounded-tl-lg" />
            <div className="hud-corner top-3 right-3 border-r-2 border-t-2 rounded-tr-lg" />
            <div className="hud-corner bottom-3 left-3 border-l-2 border-b-2 rounded-bl-lg" />
            <div className="hud-corner bottom-3 right-3 border-r-2 border-b-2 rounded-br-lg" />
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scanline shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
          </>
        )}

        {/* Analyzing overlay */}
        {analyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-sm">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 spin-slow" />
              <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-cyan-300 animate-spin" />
            </div>
            <span className="text-xs tracking-widest text-cyan-200">AI ANALYZING…</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
        {!state.active && !preview && (
          <button
            onClick={() => start()}
            disabled={state.starting}
            className="flex items-center gap-2 rounded-xl bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-200 border border-cyan-500/30 hover:bg-cyan-500/25 transition disabled:opacity-50"
          >
            <Camera className="h-4 w-4" /> Start Camera
          </button>
        )}

        {state.active && !preview && (
          <>
            <button
              onClick={handleCapture}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              <Camera className="h-4 w-4" /> Capture
            </button>
            <button
              onClick={stop}
              className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-slate-200 hover:text-rose-300 transition"
            >
              <CameraOff className="h-4 w-4" /> Stop
            </button>
            <button
              onClick={switchCamera}
              className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-slate-200 hover:text-cyan-300 transition"
            >
              <Repeat className="h-4 w-4" /> Switch
            </button>
          </>
        )}

        {preview && (
          <>
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-slate-200 hover:text-cyan-300 transition"
            >
              <RefreshCw className="h-4 w-4" /> Retake
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 rounded-xl bg-violet-500/20 px-5 py-2.5 text-sm font-semibold text-violet-200 border border-violet-500/40 hover:bg-violet-500/30 transition disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Analyze
            </button>
          </>
        )}
      </div>

      {/* Real-time hint */}
      {realtime && state.active && !preview && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cyan-300/80">
          <Activity className="h-3.5 w-3.5" />
          Real-time AI active — frames every {FRAME_INTERVAL / 1000}s
        </div>
      )}
    </div>
  );
}
