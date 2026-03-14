"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import {
  Youtube, Wand2, Smartphone, Play, Heart, MessageCircle,
  CheckCircle2, ArrowRight, Sparkles, Copy, ExternalLink,
  TrendingUp, Zap, Globe, ChevronRight, Triangle, Scissors, 
  Subtitles, Share2, Check, ArrowUpRight, Star, Crown
} from "lucide-react";

// ─── LOGO TICKER DATA ─────────────────────────────────────────────────────────
const COMPANIES = [
  {
    name: "Paystack",
    logo: (
      <div className="flex items-center gap-1.5 font-bold text-xl tracking-tight">
        <div className="grid grid-cols-2 gap-[2px]">
          <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-current rounded-sm opacity-50"></div>
          <div className="w-2.5 h-2.5 bg-current rounded-sm opacity-50"></div>
          <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
        </div>
        paystack
      </div>
    )
  },
  {
    name: "Vercel",
    logo: (
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
        <Triangle className="w-5 h-5 fill-current" />
        Vercel
      </div>
    )
  },
  {
    name: "Flutterwave",
    logo: (
      <div className="flex items-center gap-1.5 font-bold text-xl tracking-tight">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-2">
          <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" />
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
        </svg>
        flutterwave
      </div>
    )
  },
  {
    name: "Stripe",
    logo: (
      <div className="flex items-center font-bold text-2xl tracking-tighter">
        stripe
      </div>
    )
  },
  {
    name: "Moniepoint",
    logo: (
      <div className="flex items-center gap-1.5 font-bold text-xl tracking-tight">
        <div className="w-5 h-5 bg-current rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-[#0A0A0A] rounded-full"></div>
        </div>
        moniepoint
      </div>
    )
  },
  {
    name: "OpenAI",
    logo: (
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
        <Sparkles className="w-5 h-5 fill-current" />
        OpenAI
      </div>
    )
  },
  {
    name: "PiggyVest",
    logo: (
      <div className="flex items-center gap-1.5 font-bold text-xl tracking-tight">
        <div className="w-6 h-4 border-2 border-current rounded-full"></div>
        PiggyVest
      </div>
    )
  }
];

// ─── ANIMATED PIPELINE DEMO ───────────────────────────────────────────────────
function PipelineDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [urlText, setUrlText] = useState("");
  const [typed, setTyped] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStage, setAnalyzeStage] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [publishedCount, setPublishedCount] = useState(0);
  const [metrics, setMetrics] = useState({ views: 0, likes: 0, comments: 0 });
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const DEMO_URL = "youtube.com/watch?v=dQw4w9WgXcQ";
  const analyzeStages = [
    { label: "Transcribing audio...", color: "#818cf8" },
    { label: "Detecting scene changes...", color: "#818cf8" },
    { label: "Mapping retention curves...", color: "#a78bfa" },
    { label: "Extracting viral hooks...", color: "#c084fc" },
    { label: "Generating captions...", color: "#34d399" },
    { label: "Optimising for TikTok, YouTube Shorts, Reels...", color: "#34d399" },
  ];

  function resetAll() {
    setActiveStep(0);
    setUrlText("");
    setTyped(false);
    setAnalyzing(false);
    setAnalyzeProgress(0);
    setAnalyzeStage(0);
    setShowResults(false);
    setPublishedCount(0);
    setMetrics({ views: 0, likes: 0, comments: 0 });
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeStep === 0) {
      let i = 0;
      function typeChar() {
        if (i <= DEMO_URL.length) {
          setUrlText(DEMO_URL.slice(0, i));
          i++;
          timerRef.current = setTimeout(typeChar, 38);
        } else {
          setTyped(true);
          timerRef.current = setTimeout(() => setActiveStep(1), 800);
        }
      }
      timerRef.current = setTimeout(typeChar, 600);
    }

    if (activeStep === 1) {
      setAnalyzing(true);
      setAnalyzeProgress(0);
      setAnalyzeStage(0);
      let prog = 0;
      let stageIdx = 0;
      function tick() {
        prog += Math.random() * 3.5 + 0.8;
        if (prog > 100) prog = 100;
        setAnalyzeProgress(Math.round(prog));
        
        const newStage = Math.min(Math.floor((prog / 100) * analyzeStages.length), analyzeStages.length - 1);
        if (newStage !== stageIdx) {
          stageIdx = newStage;
          setAnalyzeStage(newStage);
        }
        
        if (prog < 100) {
          timerRef.current = setTimeout(tick, 60);
        } else {
          timerRef.current = setTimeout(() => setActiveStep(2), 600);
        }
      }
      timerRef.current = setTimeout(tick, 400);
    }

    if (activeStep === 2) {
      let count = 0;
      function addShort() {
        count++;
        setPublishedCount(count);
        if (count < 6) timerRef.current = setTimeout(addShort, 280);
        else timerRef.current = setTimeout(() => setActiveStep(3), 500);
      }
      timerRef.current = setTimeout(addShort, 300);
    }

    if (activeStep === 3) {
      setShowResults(true);
      const targets = { views: 1240000, likes: 142000, comments: 4800 };
      let tick = 0;
      const totalTicks = 60;
      function countUp() {
        tick++;
        const ease = 1 - Math.pow(1 - tick / totalTicks, 3);
        setMetrics({
          views: Math.round(targets.views * ease),
          likes: Math.round(targets.likes * ease),
          comments: Math.round(targets.comments * ease),
        });
        if (tick < totalTicks) timerRef.current = setTimeout(countUp, 25);
        else timerRef.current = setTimeout(() => resetAll(), 4000);
      }
      timerRef.current = setTimeout(countUp, 300);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeStep, analyzeStages.length]);

  function fmtNum(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return n;
  }

  const STEPS = [
    { num: "01", label: "Paste URL" },
    { num: "02", label: "AI Analyses" },
    { num: "03", label: "Shorts Ready" },
    { num: "04", label: "Metrics Live" },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Step indicator ── */}
      <div className="flex items-center justify-center gap-0 mb-14">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-500
                ${activeStep === i
                  ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_16px_rgba(99,102,241,0.6)]"
                  : activeStep > i
                  ? "bg-indigo-900/60 border-indigo-500/40 text-indigo-300"
                  : "bg-zinc-900 border-zinc-700 text-zinc-500"
                }
              `}>{activeStep > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}</div>
              <span className={`text-[10px] font-medium tracking-widest uppercase transition-colors duration-300
                ${activeStep === i ? "text-white" : activeStep > i ? "text-indigo-400" : "text-zinc-600"}
              `}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-[1px] mx-2 mb-5 transition-all duration-700
                ${activeStep > i ? "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]" : "bg-zinc-800"}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* ── Demo Screen ── */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_-20px_rgba(99,102,241,0.25)]" style={{ minHeight: 420 }}>

        {/* Browser chrome bar */}
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

        {/* STEP 0: Paste URL */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${activeStep === 0 ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"}`}>
          <p className="text-zinc-400 text-sm mb-2 font-medium">Step 1 — Paste your YouTube URL</p>
          <p className="text-zinc-600 text-xs mb-8">The engine handles the rest automatically</p>
          <div className="w-full max-w-lg">
            <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 gap-3 shadow-inner">
              <Youtube className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-mono text-sm text-zinc-300 flex-1 min-h-[20px]">
                {urlText}
                {activeStep === 0 && <span className="inline-block w-[2px] h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />}
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

        {/* STEP 1: AI Analysis */}
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

            {/* Master progress bar */}
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-100"
                style={{ width: `${analyzeProgress}%` }}
              />
            </div>

            {/* Stage list */}
            <div className="space-y-3">
              {analyzeStages.map((stage, i) => {
                const done = i < analyzeStage || analyzeProgress === 100;
                const active = i === analyzeStage && analyzeProgress < 100;
                return (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i > analyzeStage && analyzeProgress < 100 ? "opacity-30" : "opacity-100"}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${done ? "bg-indigo-500 border-indigo-400" : active ? "border-indigo-400 bg-indigo-500/20 animate-pulse" : "border-zinc-700 bg-transparent"}`}>
                      {done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-300 ${done ? "text-zinc-300" : active ? "text-indigo-300" : "text-zinc-600"}`}>{stage.label}</span>
                    {active && <span className="ml-auto text-[10px] text-indigo-400 font-mono animate-pulse">running</span>}
                    {done && <CheckCircle2 className="ml-auto w-3 h-3 text-indigo-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 2: Shorts Ready */}
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
                  {/* Platform badge */}
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

        {/* STEP 3: Live Metrics */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${activeStep === 3 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Live</p>
          </div>
          <p className="text-white font-bold text-lg mb-8">Your content is going viral</p>
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            {[
              { icon: <Play className="w-4 h-4 text-white" />, label: "Views", value: fmtNum(metrics.views), color: "#818cf8" },
              { icon: <Heart className="w-4 h-4 text-red-400" />, label: "Likes", value: fmtNum(metrics.likes), color: "#f87171" },
              { icon: <MessageCircle className="w-4 h-4 text-blue-400" />, label: "Comments", value: fmtNum(metrics.comments), color: "#60a5fa" },
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

      {/* Restart hint */}
      <p className="text-center text-zinc-700 text-[11px] mt-4 tracking-wide">
        Demo loops automatically · <button onClick={resetAll} className="text-indigo-500 hover:text-indigo-400 transition-colors">restart</button>
      </p>
    </div>
  );
}

// ─── BENTO FEATURES ─────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: <Wand2 className="w-5 h-5" />,
      color: "indigo",
      tag: "Core AI",
      title: "Hook Extraction",
      desc: "Our LLM analyzes your transcript, finds the highest-retention dopamine spikes, and automatically cuts them into standalone viral hooks.",
      size: "large",
      stat: "3.2×",
      statLabel: "avg retention boost",
    },
    {
      icon: <Subtitles className="w-5 h-5" />,
      color: "emerald",
      tag: "Captions",
      title: "Dynamic Captions",
      desc: "Hormozi-style captions generated in milliseconds, perfectly synced to the speaker's voice.",
      size: "small",
      stat: "< 2s",
      statLabel: "generation time",
    },
    {
      icon: <Scissors className="w-5 h-5" />,
      color: "pink",
      tag: "Vision AI",
      title: "Smart Cropping",
      desc: "Facial tracking keeps the speaker perfectly centered in the 9:16 vertical frame. Always.",
      size: "small",
      stat: "99.1%",
      statLabel: "face track accuracy",
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      color: "blue",
      tag: "Distribution",
      title: "Multi-Platform Export",
      desc: "One click generates optimal bitrates, dimensions, and metadata for YouTube Shorts, Instagram Reels, and TikTok simultaneously.",
      size: "large",
      stat: "3",
      statLabel: "platforms in one click",
    },
  ];

  type ColorKey = 'indigo' | 'emerald' | 'pink' | 'blue';

  const colorMap: Record<ColorKey, any> = {
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      icon: "text-indigo-400",
      tag: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      stat: "text-indigo-300",
      glow: "group-hover:shadow-[0_0_60px_-10px_rgba(99,102,241,0.3)]",
      line: "bg-indigo-500",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: "text-emerald-400",
      tag: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      stat: "text-emerald-300",
      glow: "group-hover:shadow-[0_0_60px_-10px_rgba(52,211,153,0.2)]",
      line: "bg-emerald-500",
    },
    pink: {
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      icon: "text-pink-400",
      tag: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      stat: "text-pink-300",
      glow: "group-hover:shadow-[0_0_60px_-10px_rgba(236,72,153,0.2)]",
      line: "bg-pink-500",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: "text-blue-400",
      tag: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      stat: "text-blue-300",
      glow: "group-hover:shadow-[0_0_60px_-10px_rgba(59,130,246,0.2)]",
      line: "bg-blue-500",
    },
  };

  return (
    <section id="platform" className="relative z-10 py-32 px-6 border-t border-white/5">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(99,102,241,0.04),transparent)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-indigo-500 inline-block" />
              Platform
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95]">
              Everything<br />
              <span className="text-zinc-500">you need</span><br />
              to scale.
            </h2>
          </div>
          <p className="text-zinc-400 max-w-sm text-base leading-relaxed md:text-right">
            No more juggling Premiere Pro, OpusClip, and CapCut. One infrastructure. The entire pipeline.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const c = colorMap[f.color as ColorKey];
            const isLarge = f.size === "large";
            return (
              <div
                key={i}
                className={`
                  group relative rounded-3xl border border-white/[0.06] bg-zinc-950/60 backdrop-blur-sm
                  overflow-hidden transition-all duration-500 cursor-default
                  ${isLarge ? "md:col-span-2" : ""}
                  ${c.glow}
                `}
              >
                {/* Top accent line */}
                <div className={`absolute top-0 left-8 right-8 h-[1px] ${c.line} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

                <div className={`relative z-10 p-8 ${isLarge ? "flex flex-col md:flex-row gap-8 items-start" : ""}`}>
                  <div className={isLarge ? "flex-1" : ""}>
                    {/* Tag + Icon row */}
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full border ${c.tag}`}>
                        {f.tag}
                      </span>
                      <div className={`w-9 h-9 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center ${c.icon}`}>
                        {f.icon}
                      </div>
                    </div>

                    <h3 className={`font-black tracking-tight text-white mb-3 ${isLarge ? "text-3xl" : "text-2xl"}`}>
                      {f.title}
                    </h3>
                    <p className="text-zinc-500 leading-relaxed text-sm">{f.desc}</p>
                  </div>

                  {/* Stat block */}
                  <div className={`${isLarge ? "shrink-0 md:text-right mt-4 md:mt-0" : "mt-8 pt-6 border-t border-white/5 flex items-end justify-between"}`}>
                    <div>
                      <p className={`font-black tracking-tighter ${c.stat} ${isLarge ? "text-5xl" : "text-4xl"}`}>
                        {f.stat}
                      </p>
                      <p className="text-zinc-600 text-[11px] font-medium tracking-wide uppercase mt-1">
                        {f.statLabel}
                      </p>
                    </div>
                    {!isLarge && (
                      <ArrowUpRight className={`w-5 h-5 ${c.icon} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


// ─── PRICING ─────────────────────────────────────────────────────────────────────
function PricingSection() {
  const { isSignedIn } = useAuth();

  const hobbyFeatures = [
    "60 min AI processing / mo",
    "720p video exports",
    "Standard AI captions",
    "Community Discord",
  ];
  const proFeatures = [
    "100 hrs AI processing / mo",
    "4K video exports",
    "Custom brand fonts & colors",
    "Priority API access",
    "Remove watermarks",
  ];
  const agencyFeatures = [
    "Unlimited AI processing",
    "Highest priority queue",
    "White-label dashboard",
    "Dedicated account manager",
    "Custom AI fine-tuning",
  ];

  return (
    <section id="pricing" className="relative z-10 py-32 px-6 border-t border-white/5 overflow-hidden">
      {/* Background orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-indigo-500 inline-block" />
            Pricing
            <span className="w-8 h-[1px] bg-indigo-500 inline-block" />
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-5 leading-[0.95]">
            Simple.<br />
            <span className="text-zinc-500">Transparent.</span>
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto text-base">
            Start free, scale when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

          {/* 1. Hobby */}
          <div className="relative rounded-3xl border border-white/[0.06] bg-zinc-950/60 backdrop-blur-sm p-8 flex flex-col transition-all duration-500 hover:border-white/10 group">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs text-zinc-600 font-semibold tracking-[0.15em] uppercase mb-2">Hobby</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter">$0</span>
                  <span className="text-zinc-600 text-sm">/ forever</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {hobbyFeatures.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-zinc-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            {isSignedIn ? (
              <Link href="/dashboard" className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 group/btn">
                Go to Dashboard
                <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 group/btn">
                  Get Started Free
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                </button>
              </SignUpButton>
            )}
          </div>

          {/* 2. Pro (Highlighted) */}
          <div className="relative rounded-3xl border border-indigo-500/25 bg-zinc-950/80 backdrop-blur-sm p-8 flex flex-col overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-[0_0_80px_-20px_rgba(99,102,241,0.4)] group md:-translate-y-2">
            {/* Top gradient bar */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            {/* Ambient inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs text-indigo-400 font-semibold tracking-[0.15em] uppercase">Pro</p>
                  <span className="flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                    <Star className="w-2.5 h-2.5" /> Popular
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter">$29</span>
                  <span className="text-zinc-500 text-sm">/ month</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-indigo-300" />
              </div>
            </div>

            <ul className="relative z-10 space-y-4 mb-10 flex-1">
              {proFeatures.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-200">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button className="relative z-10 w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
              Upgrade to Pro
              <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* 3. Agency */}
          <div className="relative rounded-3xl border border-white/[0.06] bg-zinc-950/60 backdrop-blur-sm p-8 flex flex-col transition-all duration-500 hover:border-white/10 group">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs text-zinc-600 font-semibold tracking-[0.15em] uppercase mb-2">Agency</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter">$99</span>
                  <span className="text-zinc-600 text-sm">/ month</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {agencyFeatures.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-zinc-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button className="w-full bg-white hover:bg-zinc-200 text-black py-3.5 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2 group/btn">
              Contact Sales
              <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
            </button>
          </div>

        </div>

        {/* Social proof strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-zinc-600 text-xs">
          <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> No credit card required</span>
          <span className="w-[1px] h-3 bg-zinc-800 hidden sm:block" />
          <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Cancel anytime</span>
          <span className="w-[1px] h-3 bg-zinc-800 hidden sm:block" />
          <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> SOC 2 compliant</span>
          <span className="w-[1px] h-3 bg-zinc-800 hidden sm:block" />
          <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> 99.9% uptime SLA</span>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────────
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Changelog", "Roadmap"],
    Developers: ["API Docs", "SDK", "Webhooks", "Status"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Terms", "Privacy", "Security", "Cookies"],
  };

  return (
    <footer className="relative border-t border-white/5 bg-[#0A0A0A] pt-20 pb-10 px-6 overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Top row: brand + links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-6 rounded-md bg-white flex items-center justify-center">
                <div className="size-3 bg-black rounded-sm" />
              </div>
              <span className="font-bold tracking-tight text-white text-lg">Omni</span>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed max-w-[160px]">
              The infrastructure for algorithmic growth.
            </p>
            <div className="flex gap-3 mt-6">
              {["𝕏", "in", "gh"].map((s, i) => (
                <Link key={i} href="#" className="w-8 h-8 rounded-lg border border-white/8 bg-zinc-900/60 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all text-xs font-bold">
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-600 mb-4">{cat}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-700 text-xs">
            © 2026 Omni AI Inc. — Built for the modern creator.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-600 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── FULL PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { isSignedIn } = useAuth(); // Safely grab the auth state

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-zinc-50 relative selection:bg-indigo-500/30 overflow-hidden">

      {/* INJECT CUSTOM CSS FOR INFINITE MARQUEE */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1.5rem)); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 h-16 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-semibold tracking-tight text-lg flex items-center gap-2">
              <div className="size-5 rounded-md bg-white flex items-center justify-center">
                <div className="size-2.5 bg-black rounded-sm" />
              </div>
              Omni
            </span>
            <div className="hidden md:flex items-center gap-8 text-[13px] tracking-wide font-medium text-zinc-400">
              {["Platform", "Pricing"].map((item) => (
                <Link key={item} href={`#${item.toLowerCase()}`} className="relative py-1 transition-colors hover:text-zinc-50 group">
                  {item}
                  <span className="absolute inset-x-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 rounded-full bg-indigo-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors">Start Building</button>
                </SignUpButton>
              </>
            )}
            {isSignedIn && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block mr-2">Go to Dashboard</Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 pt-40 pb-10 flex flex-col items-center justify-center px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-300 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
          Omnichannel Engine v2.0
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6 leading-[1.1]">
          The infrastructure for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">algorithmic growth.</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mb-10 font-light leading-relaxed">
          An enterprise-grade engine that transcribes, analyzes, and distributes your content across YouTube, TikTok, and web simultaneously.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {!isSignedIn && (
            <SignUpButton mode="modal">
              <button className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                Get API Keys
                <ArrowRight className="w-4 h-4" />
              </button>
            </SignUpButton>
          )}
          {isSignedIn && (
            <Link href="/dashboard" className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
              Go to Dashboard
            </Link>
          )}
          <button className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
            Read the Docs
          </button>
        </div>
      </section>

      {/* ── LOGO TICKER (SOCIAL PROOF) ── */}
      <section className="relative z-10 py-16 border-y border-white/5 bg-zinc-950/30 backdrop-blur-sm mt-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm font-medium text-zinc-500 mb-8 uppercase tracking-widest">
            Trusted by forward-thinking teams at
          </p>
          
          <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex gap-12 sm:gap-24 items-center w-max animate-scroll">
              {[...COMPANIES, ...COMPANIES].map((company, idx) => (
                <div 
                  key={idx} 
                  className="text-zinc-500 hover:text-white transition-colors duration-300 flex-shrink-0 cursor-default"
                >
                  {company.logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ANIMATED PIPELINE DEMO ── */}
      <section className="relative z-10 py-24 px-4">
        <div className="text-center mb-12">
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">See it in action</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            From raw footage to viral clips
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-base">
            Watch how Omni turns one long video into six optimised shorts — live.
          </p>
        </div>
        <PipelineDemo />
      </section>

      {/* ── BENTO FEATURES ── */}
      <FeaturesSection />

      {/* ── PRICING ── */}
      <PricingSection />

      {/* ── FOOTER ── */}
      <Footer />

    </main>
  );
}