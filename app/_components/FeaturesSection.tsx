import { Wand2, Scissors, Share2 } from "lucide-react";
import { Subtitles, ArrowUpRight } from "lucide-react";

type ColorKey = "indigo" | "emerald" | "pink" | "blue";

const colorMap: Record<ColorKey, {
  bg: string; border: string; icon: string;
  tag: string; stat: string; glow: string; line: string;
}> = {
  indigo: {
    bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "text-indigo-400",
    tag: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", stat: "text-indigo-300",
    glow: "group-hover:shadow-[0_0_60px_-10px_rgba(99,102,241,0.3)]", line: "bg-indigo-500",
  },
  emerald: {
    bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400",
    tag: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", stat: "text-emerald-300",
    glow: "group-hover:shadow-[0_0_60px_-10px_rgba(52,211,153,0.2)]", line: "bg-emerald-500",
  },
  pink: {
    bg: "bg-pink-500/10", border: "border-pink-500/20", icon: "text-pink-400",
    tag: "bg-pink-500/10 text-pink-400 border-pink-500/20", stat: "text-pink-300",
    glow: "group-hover:shadow-[0_0_60px_-10px_rgba(236,72,153,0.2)]", line: "bg-pink-500",
  },
  blue: {
    bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400",
    tag: "bg-blue-500/10 text-blue-400 border-blue-500/20", stat: "text-blue-300",
    glow: "group-hover:shadow-[0_0_60px_-10px_rgba(59,130,246,0.2)]", line: "bg-blue-500",
  },
};

const FEATURES = [
  {
    icon: <Wand2 className="w-5 h-5" />, color: "indigo" as ColorKey, tag: "Core AI",
    title: "Hook Extraction",
    desc: "Our LLM analyzes your transcript, finds the highest-retention dopamine spikes, and automatically cuts them into standalone viral hooks.",
    size: "large", stat: "3.2×", statLabel: "avg retention boost",
  },
  {
    icon: <Subtitles className="w-5 h-5" />, color: "emerald" as ColorKey, tag: "Captions",
    title: "Dynamic Captions",
    desc: "Hormozi-style captions generated in milliseconds, perfectly synced to the speaker's voice.",
    size: "small", stat: "< 2s", statLabel: "generation time",
  },
  {
    icon: <Scissors className="w-5 h-5" />, color: "pink" as ColorKey, tag: "Vision AI",
    title: "Smart Cropping",
    desc: "Facial tracking keeps the speaker perfectly centered in the 9:16 vertical frame. Always.",
    size: "small", stat: "99.1%", statLabel: "face track accuracy",
  },
  {
    icon: <Share2 className="w-5 h-5" />, color: "blue" as ColorKey, tag: "Distribution",
    title: "Multi-Platform Export",
    desc: "One click generates optimal bitrates, dimensions, and metadata for YouTube Shorts, Instagram Reels, and TikTok simultaneously.",
    size: "large", stat: "3", statLabel: "platforms in one click",
  },
];

// Noise texture — defined once, not inlined per element
const NOISE_BG = "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]";

export default function FeaturesSection() {
  return (
    <section id="platform" className="relative z-10 py-32 px-6 border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(99,102,241,0.04),transparent)] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const c = colorMap[f.color];
            const isLarge = f.size === "large";
            return (
              <div
                key={i}
                className={`group relative rounded-3xl border border-white/[0.06] bg-zinc-950/60 backdrop-blur-sm overflow-hidden transition-all duration-500 cursor-default ${isLarge ? "md:col-span-2" : ""} ${c.glow}`}
              >
                <div className={`absolute top-0 left-8 right-8 h-[1px] ${c.line} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
                <div className={`absolute inset-0 opacity-[0.015] ${NOISE_BG}`} />
                <div className={`relative z-10 p-8 ${isLarge ? "flex flex-col md:flex-row gap-8 items-start" : ""}`}>
                  <div className={isLarge ? "flex-1" : ""}>
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
                  <div className={`${isLarge ? "shrink-0 md:text-right mt-4 md:mt-0" : "mt-8 pt-6 border-t border-white/5 flex items-end justify-between"}`}>
                    <div>
                      <p className={`font-black tracking-tighter ${c.stat} ${isLarge ? "text-5xl" : "text-4xl"}`}>{f.stat}</p>
                      <p className="text-zinc-600 text-[11px] font-medium tracking-wide uppercase mt-1">{f.statLabel}</p>
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