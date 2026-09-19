// ============================================================
// AudioCard — AI Voice Output
// Handles both a backend-provided audio URL and raw data URIs.
// Does NOT generate fake audio — only plays what backend returns.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Square, Volume2 } from "lucide-react";

interface Props {
  audioUrl: string; // empty string when backend has not returned audio
  active: boolean; // whether AI is processing
}

export default function AudioCard({ audioUrl, active }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [audioUrl]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };
  const replay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    play();
  };
  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlaying(false);
  };

  const hasAudio = Boolean(audioUrl);

  return (
    <div className="glass rounded-2xl p-5 fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Volume2 className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">AI VOICE OUTPUT</h3>
        </div>
        <span className={`text-[10px] tracking-widest ${hasAudio ? "text-emerald-400" : "text-slate-500"}`}>
          {hasAudio ? "READY" : active ? "GENERATING…" : "IDLE"}
        </span>
      </div>

      <audio ref={audioRef} src={audioUrl || undefined} preload="auto" />

      {/* Waveform */}
      <div className="flex items-end justify-center gap-1 h-16 mb-4">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className={`w-1 rounded-full ${playing ? "bg-cyan-400 audio-bar" : "bg-slate-700"}`}
            style={{
              height: `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%`,
              animationDelay: `${i * 0.05}s`,
              opacity: hasAudio ? 0.9 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-slate-700/60 mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={playing ? pause : play}
          disabled={!hasAudio}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          onClick={replay}
          disabled={!hasAudio}
          className="flex h-10 w-10 items-center justify-center rounded-full glass text-slate-200 hover:text-cyan-300 transition disabled:opacity-30"
          aria-label="Replay"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={stop}
          disabled={!hasAudio}
          className="flex h-10 w-10 items-center justify-center rounded-full glass text-slate-200 hover:text-rose-300 transition disabled:opacity-30"
          aria-label="Stop"
        >
          <Square className="h-4 w-4" />
        </button>
      </div>

      {!hasAudio && (
        <p className="text-center text-xs text-slate-500 mt-4">
          Audio will appear here once the AI backend returns a voice response.
        </p>
      )}
    </div>
  );
}
