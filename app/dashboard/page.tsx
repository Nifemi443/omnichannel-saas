"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  Youtube, Sparkles, UploadCloud, TrendingUp,
  Scissors, Eye, Zap, Clock, ArrowUpRight, Play,
  Globe, ChevronRight, Plus, FileVideo,
  Settings, Crown, BarChart3, Film, Search,
  Radio, BrainCircuit, Target, CheckCircle2, Terminal,
  Video, Type, FileText, Hash, Copy, RotateCcw
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  userId: string;
  originalUrl: string;
  title: string | null;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  transcript: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QuickAction {
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  pro?: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Videos Processed", value: "0", icon: Film, color: "indigo", change: null },
  { label: "Clips Generated", value: "0", icon: Scissors, color: "violet", change: null },
  { label: "Total Views", value: "—", icon: Eye, color: "emerald", change: null },
  { label: "Avg. Retention Lift", value: "—", icon: TrendingUp, color: "amber", change: null },
];

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Paste YouTube URL", desc: "Auto-extract viral clips", icon: Youtube, color: "red" },
  { label: "Upload Video File", desc: "MP4, MOV, WEBM up to 2 GB", icon: UploadCloud, color: "indigo" },
  { label: "Batch Process", desc: "Queue multiple videos at once", icon: Plus, color: "emerald", pro: true },
];

const PLATFORMS = [
  { name: "YouTube Shorts", icon: Youtube, pct: 0 },
  { name: "TikTok", icon: Play, pct: 0 },
  { name: "Instagram Reels", icon: Globe, pct: 0 },
];

// ── Pipeline & Mock Data ───────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { id: 1, icon: Radio, title: "Fetching Source Material", desc: "Downloading 1080p video & separating audio" },
  { id: 2, icon: BrainCircuit, title: "Transcribing & Diarizing", desc: "Converting speech to text via Whisper AI" },
  { id: 3, icon: Target, title: "Hunting for Dopamine Hooks", desc: "Analyzing transcript for high-retention moments" },
  { id: 4, icon: Scissors, title: "Auto-Cropping & Captions", desc: "Tracking faces and applying dynamic B-roll text" },
  { id: 5, icon: TrendingUp, title: "Generating SEO Metadata", desc: "Crafting viral titles, captions, and hashtags" },
];

const FAKE_LOGS = [
  "Resolving video stream URL...",
  "Audio codec detected: AAC 48000Hz...",
  "Running facial recognition model v2.4...",
  "Confidence score: 98.4%...",
  "Keyword match found...",
  "Applying 9:16 crop map...",
  "Calculating retention probability...",
];

const MOCK_SEO_DATA = {
  title: "How to spot a fake duplex in Lekki Phase 1 🏠❌",
  caption: "Stop letting agents sell you overpriced apartments with bad plumbing! If you are hunting for a 3-bedroom duplex in Lagos, here is the exact checklist you need to bring to your next viewing.\n\nDon't sign anything until you check the water pressure in the guest bathroom.",
  hashtags: "#LagosRealEstate #LekkiProperties #HouseHuntingLagos"
};

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, change,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  change: string | null;
}) {
  const palette: Record<string, { bg: string; icon: string; ring: string }> = {
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-400", ring: "border-indigo-500/20" },
    violet: { bg: "bg-violet-500/10", icon: "text-violet-400", ring: "border-violet-500/20" },
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", ring: "border-emerald-500/20" },
    amber:  { bg: "bg-amber-500/10",  icon: "text-amber-400",  ring: "border-amber-500/20"  },
  };
  const c = palette[color] ?? palette.indigo;

  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-5 transition-all duration-300 hover:border-white/10">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.ring} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        {change && (
          <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <ArrowUpRight className="w-3 h-3" /> {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-black tracking-tight text-white mb-1">{value}</p>
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
    </div>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Process States: 'idle' | 'processing' | 'complete'
  const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch existing projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects ?? []);
        }
      } catch {
        // Non-fatal — silently fail, empty state will show
      } finally {
        setProjectsLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (processStatus === 'processing') {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, processStatus]);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || processStatus !== 'idle') return;

    const looksLikeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(trimmed);
    if (!looksLikeUrl) {
      setApiError("Please enter a valid YouTube URL.");
      return;
    }

    setApiError(null);

    // ── Call POST /api/projects ──────────────────────────────────────────────
    let project: Project;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          res.status === 429
            ? `Too many requests. Try again in ${Math.ceil((data.resetIn ?? 60000) / 1000)}s.`
            : res.status === 403
            ? data.error
            : data.error ?? "Something went wrong. Please try again.";
        setApiError(msg);
        return;
      }

      project = data.project;
      setCurrentProject(project);
      // Prepend to Recent Projects immediately — no refetch needed
      setProjects(prev => [project, ...prev]);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
      return;
    }

    // ── Start UI processing simulation ───────────────────────────────────────
    // The real AI job runs in the background; this animation tracks the UX flow.
    setProcessStatus('processing');
    setActiveStep(1);
    setLogs([`[SYSTEM] Initializing Omni AI Engine... (project: ${project.id})`]);

    let currentStep = 1;
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep > 5) {
        clearInterval(stepInterval);
        setTimeout(() => setProcessStatus('complete'), 1000);
      } else {
        setActiveStep(currentStep);
      }
    }, 2000);

    const logInterval = setInterval(() => {
      if (currentStep > 5) {
        clearInterval(logInterval);
        return;
      }
      const randomLog = FAKE_LOGS[Math.floor(Math.random() * FAKE_LOGS.length)];
      const timestamp = new Date().toISOString().split('T')[1].substring(0, 12);
      setLogs(prev => [...prev, `[${timestamp}] ${randomLog}`]);
    }, 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${MOCK_SEO_DATA.title}\n\n${MOCK_SEO_DATA.caption}\n\n${MOCK_SEO_DATA.hashtags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetProcess = () => {
    setProcessStatus('idle');
    setUrl("");
    setActiveStep(0);
    setLogs([]);
    setApiError(null);
    setCurrentProject(null);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (processStatus !== 'idle') return;
    const files = e.dataTransfer.files;
    if (files.length) console.log("Dropped file:", files[0].name);
  }, [processStatus]);

  const onUploadKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileRef.current?.click();
    }
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-50">

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-base">
              <div className="size-5 rounded-md bg-white flex items-center justify-center">
                <div className="size-2.5 bg-black rounded-sm" />
              </div>
              Omni
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-zinc-500">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-white/5 text-white">
                Dashboard
              </Link>
              <Link href="/projects" className="px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/analytics" className="px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                Analytics
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-zinc-900/60 text-xs font-semibold text-zinc-400 hover:text-white hover:border-white/10 transition-all">
              <Crown className="w-3 h-3 text-amber-400" />
              Free Plan
            </button>
            <Link
              href="/settings"
              className="w-8 h-8 rounded-lg border border-white/[0.06] bg-zinc-900/60 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/10 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
            <UserButton
              appearance={{
                elements: { avatarBox: "w-8 h-8 rounded-lg" },
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Greeting ── */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            {greeting}{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-zinc-500 text-sm">
            Your AI content engine is ready. Paste a link or upload a file to get started.
          </p>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── Main Work Area ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Left: New Project Card (Dynamic Area) */}
          <div className="lg:col-span-2 relative rounded-2xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <div className="p-6 sm:p-8">
              
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {processStatus === 'complete' ? 'Optimization Complete' : 'New Project'}
                    </h2>
                    <p className="text-xs text-zinc-600">
                      {processStatus === 'complete' ? '1 viral clip generated with metadata' : 'Generate optimized clips from any video'}
                    </p>
                  </div>
                </div>
                {processStatus === 'complete' && (
                  <button onClick={resetProcess} className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5">
                    <RotateCcw className="w-3 h-3" /> Start Another
                  </button>
                )}
              </div>

              {/* URL Input Form (Hidden on complete) */}
              {processStatus !== 'complete' && (
                <form onSubmit={handleGenerate} className="flex flex-col gap-3 mb-6">
                  {apiError && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                      <span className="shrink-0">⚠</span>
                      {apiError}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Youtube className={`w-4 h-4 ${processStatus === 'processing' ? 'text-zinc-600' : 'text-red-500/70'}`} />
                    </div>
                    <input
                      type="text"
                      required
                      disabled={processStatus === 'processing'}
                      placeholder="https://youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={processStatus === 'processing'}
                    className={`font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg whitespace-nowrap text-sm ${
                      processStatus === 'processing' 
                      ? "bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none" 
                      : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20 hover:shadow-indigo-500/30"
                    }`}
                  >
                    {processStatus === 'processing' ? (
                      <><div className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" /> Processing</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Generate</>
                    )}
                  </button>
                  </div>
                </form>
              )}

              {/* Fixed-height container prevents layout shift when switching states */}
              <div className="min-h-[220px]">

              {/* State 1: IDLE (Drag & Drop) */}
              {processStatus === 'idle' && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] bg-white/5 flex-1" />
                    <span className="text-zinc-700 text-[10px] font-bold tracking-[0.15em] uppercase">or upload a file</span>
                    <div className="h-[1px] bg-white/5 flex-1" />
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={onUploadKeyDown}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`
                      w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer
                      ${isDragging ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/[0.04] hover:border-white/10 hover:bg-white/[0.01]"}
                    `}
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${isDragging ? "bg-indigo-500/10 border-indigo-500/20" : "bg-zinc-900 border-white/5"}`}>
                      <UploadCloud className={`w-5 h-5 transition-colors ${isDragging ? "text-indigo-400" : "text-zinc-500"}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-300 font-medium text-sm">
                        Drop your video here or <span className="text-indigo-400">browse</span>
                      </p>
                      <p className="text-zinc-600 text-xs mt-1">MP4, MOV, WEBM — max 2 GB</p>
                    </div>
                    <input ref={fileRef} type="file" accept="video/*" className="hidden" />
                  </div>
                </div>
              )}

              {/* State 2: PROCESSING (Pipeline Demo) */}
              {processStatus === 'processing' && (
                <div className="animate-fade-in flex flex-col sm:flex-row gap-6 p-5 rounded-xl bg-[#050505] border border-white/[0.04]">
                  {/* Left: Steps */}
                  <div className="flex-1 space-y-4">
                    {PIPELINE_STEPS.map((step) => {
                      const isActive = activeStep === step.id;
                      const isDone = activeStep > step.id;
                      return (
                        <div key={step.id} className={`flex items-start gap-3 transition-all duration-500 ${isActive ? 'opacity-100' : isDone ? 'opacity-40' : 'opacity-20'}`}>
                          <div className="mt-0.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : isActive ? (
                              <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-zinc-700" />
                            )}
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${isActive ? 'text-indigo-400' : 'text-zinc-300'}`}>{step.title}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Right: Console — fixed height on all breakpoints to prevent layout growth */}
                  <div className="flex-1 bg-black rounded-lg border border-white/[0.06] p-3 font-mono text-[10px] text-zinc-400 relative overflow-hidden flex flex-col h-48">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                      <Terminal className="w-3 h-3 text-zinc-600" />
                      <span className="text-zinc-600 font-semibold tracking-wider text-[9px]">SYSTEM_LOGS</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                      {logs.map((log, idx) => (
                        <div key={idx}><span className="text-emerald-500/70 mr-1.5">›</span>{log}</div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                </div>
              )}

              {/* State 3: COMPLETE (Minimalist Output UI) */}
              {processStatus === 'complete' && (
                <div className="animate-fade-in border-t border-white/5 pt-6 mt-2 grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Left: Video Placeholder */}
                  <div className="md:col-span-2">
                    <div className="w-full aspect-[9/16] rounded-xl bg-zinc-900 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-white/10 transition-all">
                      <Video className="w-8 h-8 text-zinc-700 group-hover:text-zinc-500 transition-colors mb-2" />
                      <span className="text-[10px] text-zinc-600 font-mono">Video Render</span>
                    </div>
                  </div>
                  {/* Right: Clean SEO Data */}
                  <div className="md:col-span-3 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5 text-zinc-500">
                          <Type className="w-3 h-3" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Hook Title</span>
                        </div>
                        <p className="text-sm text-zinc-200 font-medium">{MOCK_SEO_DATA.title}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5 text-zinc-500">
                          <FileText className="w-3 h-3" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Conversion Caption</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{MOCK_SEO_DATA.caption}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 text-zinc-500">
                          <Hash className="w-3 h-3" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Targeted Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {MOCK_SEO_DATA.hashtags.split(' ').map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-zinc-300 text-[10px]">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className={`mt-6 w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        copied ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white text-black hover:bg-zinc-200"
                      }`}
                    >
                      {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Metadata</>}
                    </button>
                  </div>
                </div>
              )}

              </div>{/* end min-h container */}

            </div>
          </div>

          {/* Right: Quick Actions + Usage */}
          <div className="flex flex-col gap-4">

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-5">
              <h3 className="text-xs font-bold text-zinc-500 tracking-[0.15em] uppercase mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group text-left"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      a.color === "red"    ? "bg-red-500/10 border border-red-500/20" :
                      a.color === "indigo" ? "bg-indigo-500/10 border border-indigo-500/20" :
                                            "bg-emerald-500/10 border border-emerald-500/20"
                    }`}>
                      <a.icon className={`w-4 h-4 ${
                        a.color === "red"    ? "text-red-400" :
                        a.color === "indigo" ? "text-indigo-400" :
                                              "text-emerald-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                          {a.label}
                        </p>
                        {a.pro && (
                          <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pro
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600">{a.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Usage Meter */}
            <div className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-500 tracking-[0.15em] uppercase">Usage</h3>
                <span className="text-[10px] text-zinc-600 font-medium">Free Plan</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-400">Processing</span>
                    <span className="text-xs text-zinc-500 font-mono">0 / 60 min</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: "0%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-400">Storage</span>
                    <span className="text-xs text-zinc-500 font-mono">0 / 5 GB</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: "0%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-400">Exports</span>
                    <span className="text-xs text-zinc-500 font-mono">0 / 10</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: "0%" }} />
                  </div>
                </div>
              </div>
              <button className="w-full mt-5 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-bold hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-1.5">
                <Crown className="w-3 h-3" />
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* ── Recent Projects ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-bold text-white">Recent Projects</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  placeholder="Search projects..."
                  className="bg-zinc-900/60 border border-white/[0.06] rounded-lg py-1.5 pl-9 pr-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 w-48"
                />
              </div>
              <button className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-zinc-900/60 text-xs font-medium text-zinc-400 hover:text-white hover:border-white/10 transition-all flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3" />
                Filter
              </button>
            </div>
          </div>

          {/* Empty State or Projects List */}
          {projectsLoading ? (
            <div className="p-10 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-center mb-5">
                <FileVideo className="w-7 h-7 text-zinc-700" />
              </div>
              <p className="text-white font-semibold mb-2">No projects yet</p>
              <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">
                Paste a YouTube link or upload a video to generate algorithm-ready clips, captions, and SEO metadata.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Project
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {projects.map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                    <FileVideo className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {p.title ?? p.originalUrl}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    p.status === "COMPLETED"  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    p.status === "PROCESSING" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                                "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Platform Distribution ── */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center">
                <p.icon className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-300">{p.name}</p>
                <p className="text-[10px] text-zinc-600">{p.pct} clips exported</p>
              </div>
              <span className="text-lg font-black text-zinc-700 tracking-tight">—</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}