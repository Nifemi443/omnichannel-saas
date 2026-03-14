"use client";

import { useState, useEffect, useRef } from "react";
import {
  Youtube, Wand2, Play, Heart, MessageCircle,
  CheckCircle2, ArrowRight, TrendingUp, Zap,
} from "lucide-react";

// ─── Module-level: never recreated on render ───────────────────────────────────
const DEMO_URL = "youtube.com/watch?v=dQw4w9WgXcQ";

const ANALYZE_STAGES = [
  { label: "Transcribing audio...", color: "#818cf8" },
  { label: "Detecting scene changes...", color: "#818cf8" },
  { label: "Mapping retention curves...", color: "#a78bfa" },
  { label: "Extracting viral hooks...", color: "#c084fc" },
  { label: "Generating captions...", color: "#34d399" },
  { label: "Optimising for TikTok, YouTube Shorts, Reels...", color: "#34d399" },
];

const STEPS = [
  { num: "01", label: "Paste URL" },
  { num: "02", label: "AI Analyses" },
  { num: "03", label: "Shorts Ready" },
  { num: "04", label: "Metrics Live" },
];

// Consistent return type — always string
function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

export default function PipelineDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [urlText, setUrlText] = useState("");
  const [typed, setTyped] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStage, setAnalyzeStage] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [metrics, setMetrics] = useState({ views: 0, likes: 0, comments: 0 });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetAll() {
    setActiveStep(0);
    setUrlText("");
    setTyped(false);
    setAnalyzeProgress(0);
    setAnalyzeStage(0);
    setPublishedCount(0);
    setMetrics({ views: 0, likes: 0, comments: 0 });
  }

  useEffect(() => {
    // ── Fix: cancelled flag prevents state updates after unmount / step change ──
    let cancelled = false;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeStep === 0) {
      let i = 0;
      function typeChar() {
        if (cancelled) return;
        if (i <= DEMO_URL.length) {
          setUrlText(DEMO_URL.slice(0, i));
          i++;
          timerRef.current = setTimeout(typeChar, 38);
        } else {
          setTyped(true);
          timerRef.current = setTimeout(() => {
            if (!cancelled) setActiveStep(1);
          }, 800);
        }
      }
      timerRef.current = setTimeout(typeChar, 600);
    }

    if (activeStep === 1) {
      setAnalyzeProgress(0);
      setAnalyzeStage(0);
      let prog = 0;
      let stageIdx = 0;
      function tick() {
        if (cancelled) return;
        prog += Math.random() * 3.5 + 0.8;
        if (prog > 100) prog = 100;
        setAnalyzeProgress(Math.round(prog));
        const newStage = Math.min(
          Math.floor((prog / 100) * ANALYZE_STAGES.length),
          ANALYZE_STAGES.length - 1,
        );
        if (newStage !== stageIdx) {
          stageIdx = newStage;
          setAnalyzeStage(newStage);
        }
        if (prog < 100) {
          timerRef.current = setTimeout(tick, 60);
        } else {
          timerRef.current = setTimeout(() => {
            if (!cancelled) setActiveStep(2);
          }, 600);
        }
      }
      timerRef.current = setTimeout(tick, 400);
    }

    if (activeStep === 2) {
      let count = 0;
      function addShort() {
        if (cancelled) return;
        count++;
        setPublishedCount(count);
        if (count < 6) {
          timerRef.current = setTimeout(addShort, 280);
        } else {
          timerRef.current = setTimeout(() => {
            if (!cancelled) setActiveStep(3);
          }, 500);
        }
      }
      timerRef.current = setTimeout(addShort, 300);
    }

    if (activeStep === 3) {
      const targets = { views: 1_240_000, likes: 142_000, comments: 4_800 };
      let tick = 0;
      const totalTicks = 60;
      function countUp() {
        if (cancelled) return;
        tick++;
        const ease = 1 - Math.pow(1 - tick / totalTicks, 3);
        setMetrics({
          views: Math.round(targets.views * ease),
          likes: Math.round(targets.likes * ease),
          comments: Math.round(targets.comments * ease),
        });
        if (tick < totalTicks) {
          timerRef.current = setTimeout(countUp, 25);
        } else {
          timerRef.current = setTimeout(() => {
            if (!cancelled) resetAll();
          }, 4_000);
        }
      }
      timerRef.current = setTimeout(countUp, 300);
    }

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeStep]); // analyzeStages.length removed — it's a stable module constant now

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-14">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-500
                  ${activeStep === i
                    ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_16px_rgba(99,102,241,0.6)]"
                    : activeStep > i
                    ? "bg-indigo-900/60 border-indigo-500/40 text-indigo-300"
                    : "bg-zinc-900 border-zinc-700 text-zinc-500"
                  }
                `}
              >
                {activeStep > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span
                className={`text-[10px] font-medium tracking-widest uppercase transition-colors duration-300
                  ${activeStep === i ? "text-white" : activeStep > i ? "text-indigo-400" : "text-zinc-600"}
                `}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-[1px] mx-2 mb-5 transition-all duration-700
                  ${activeStep > i ? "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]" : "bg-zinc-800"}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Demo screen */}
      <div
        className="relative bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_-20px_rgba(99,102,241,0.25)]"
        style={{ minHeight: 420 }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/60">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 mx-4 bg-zinc-800/80 rounded-md px-3 py-1 text-[11px] text-zinc-500 font-mono flex items-center gap-2">
            <span className="text-zinc-600">omni.ai</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400">dashboard</span>
          </div>
        </div>

        {/* Step 0: Paste URL */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${activeStep === 0 ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"}`}>
          <p className="text-zinc-400 text-sm mb-2 font-medium">Step 1 — Paste your YouTube URL</p>
          <p className="text-zinc-600 text-xs mb-8">The engine handles the rest automatically</p>
          <div className="w-full max-w-lg">
            <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 gap-3 shadow-inner">
              <Youtube className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-mono text-sm text-zinc-300 flex-1 min-h-[20px]">
                {urlText}
                {activeStep === 0 && (
                  <span className="inline-block w-[2px] h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
                )}
              </span>
              <div className={`shrink-0 transition-all duration-300 ${typed ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div className={`mt-3 flex justify-end transition-all duration-300 ${typed ? "opacity-100" : "opacity-0"}`}>
              <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3 h-3" /> Processing...
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: AI Analysis */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${activeStep === 1 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}>
          <div className="w-full max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Neural Analysis Running</p>
                <p className="text-zinc-500 text-xs">Scanning 45:12 of footage</p>
              </div>
              <span className="ml-auto font-mono text-indigo-400 font-bold text-lg">{analyzeProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-100"
                style={{ width: `${analyzeProgress}%` }}
              />
            </div>
            <div className="space-y-3">
              {ANALYZE_STAGES.map((stage, i) => {
                const done = i < analyzeStage || analyzeProgress === 100;
                const active = i === analyzeStage && analyzeProgress < 100;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 transition-all duration-300 ${i > analyzeStage && analyzeProgress < 100 ? "opacity-30" : "opacity-100"}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${done ? "bg-indigo-500 border-indigo-400" : active ? "border-indigo-400 bg-indigo-500/20 animate-pulse" : "border-zinc-700 bg-transparent"}`}>
                      {done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-300 ${done ? "text-zinc-300" : active ? "text-indigo-300" : "text-zinc-600"}`}>
                      {stage.label}
                    </span>
                    {active && <span className="ml-auto text-[10px] text-indigo-400 font-mono animate-pulse">running</span>}
                    {done && <CheckCircle2 className="ml-auto w-3 h-3 text-indigo-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Shorts Ready */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${activeStep === 2 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}>
          <p className="text-white text-sm font-semibold mb-1">6 viral shorts generated</p>
          <p className="text-zinc-500 text-xs mb-8">Captioned · Cropped · Optimised for every platform</p>
          <div className="flex items-end gap-3 justify-center">
            {[...Array(6)].map((_, i) => {
              const visible = i < publishedCount;
              const heights = [160, 140, 170, 150, 165, 145];
              return (
                <div
                  key={i}
                  className="relative bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shrink-0 transition-all duration-500"
                  style={{
                    width: 56,
                    height: heights[i],
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-900" />
                  <div className="absolute bottom-2 left-0 right-0 px-2 space-y-1">
                    <div className="h-1 bg-white/20 rounded-full" />
                    <div className="h-1 w-2/3 bg-white/10 rounded-full" />
                  </div>
                  <div className={`absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${i % 3 === 0 ? "bg-red-500/30 text-red-300" : i % 3 === 1 ? "bg-zinc-700 text-zinc-300" : "bg-pink-500/30 text-pink-300"}`}>
                    {i % 3 === 0 ? "YT" : i % 3 === 1 ? "TK" : "IG"}
                  </div>
                  {visible && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Live Metrics */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${activeStep === 3 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Live</p>
          </div>
          <p className="text-white font-bold text-lg mb-8">Your content is going viral</p>
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            {[
              { icon: <Play className="w-4 h-4 text-white" />, label: "Views", value: fmtNum(metrics.views) },
              { icon: <Heart className="w-4 h-4 text-red-400" />, label: "Likes", value: fmtNum(metrics.likes) },
              { icon: <MessageCircle className="w-4 h-4 text-blue-400" />, label: "Comments", value: fmtNum(metrics.comments) },
            ].map((m, i) => (
              <div key={i} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">{m.icon}</div>
                <span className="font-bold text-xl text-white font-mono">{m.value}</span>
                <span className="text-zinc-500 text-[10px] font-medium">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>across YouTube Shorts, TikTok & Instagram Reels</span>
          </div>
        </div>
      </div>

      <p className="text-center text-zinc-700 text-[11px] mt-4 tracking-wide">
        Demo loops automatically ·{" "}
        <button onClick={resetAll} className="text-indigo-500 hover:text-indigo-400 transition-colors">
          restart
        </button>
      </p>
    </div>
  );
}