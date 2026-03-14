import {
  Youtube,
  Link2,
  ArrowRight,
  Sparkles,
  Scissors,
  Subtitles,
  Smartphone
} from "lucide-react";

/* VISUAL PIPELINE SHOWCASE SECTION */
      <section className="relative w-full max-w-6xl mx-auto px-6 pb-40">
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            From raw video to viral clips in seconds.
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Our AI engine analyzes your content, finds the most engaging moments, and automatically formats them for the algorithm.
          </p>
        </div>

        {/* The 3-Step UI Mockup */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* STEP 1: Input */}
          <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5">
                <Youtube className="w-5 h-5 text-red-500" />
              </div>
              <span className="font-semibold text-lg">1. Drop Link</span>
            </div>
            
            {/* Mock Input Field */}
            <div className="mt-auto bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 transform group-hover:-translate-y-1 transition-transform duration-500">
              <Link2 className="w-5 h-5 text-zinc-500" />
              <div className="h-2 w-3/4 bg-zinc-800 rounded-full" />
            </div>
          </div>

          {/* Animated Connecting Arrow (Desktop only) */}
          <div className="hidden lg:flex absolute top-1/2 left-[33%] -translate-y-1/2 -translate-x-1/2 text-zinc-600 z-10">
            <ArrowRight className="w-8 h-8 animate-pulse" />
          </div>

          {/* STEP 2: AI Processing */}
          <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden border-t-indigo-500/50 group">
             <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-semibold text-lg">2. Omni Engine</span>
            </div>

            {/* Mock Processing UI */}
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                <Scissors className="w-4 h-4 text-zinc-400" />
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[70%] rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                <Subtitles className="w-4 h-4 text-zinc-400" />
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-[45%] rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Animated Connecting Arrow (Desktop only) */}
          <div className="hidden lg:flex absolute top-1/2 right-[33%] -translate-y-1/2 translate-x-1/2 text-zinc-600 z-10">
            <ArrowRight className="w-8 h-8 animate-pulse" />
          </div>

          {/* STEP 3: Viral Output */}
          <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden group">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-semibold text-lg">3. Viral Output</span>
            </div>

            {/* Mock Mobile Phone */}
            <div className="mt-auto mx-auto w-32 h-48 bg-zinc-950 border-[4px] border-zinc-800 rounded-[2rem] relative overflow-hidden transform group-hover:scale-105 transition-transform duration-500 shadow-2xl">
              {/* Mock Video Content */}
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-zinc-700" />
              {/* Mock Captions */}
              <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1">
                 <div className="bg-emerald-500 text-black text-[8px] font-bold px-2 py-0.5 rounded-sm transform -rotate-2">WAIT FOR IT</div>
                 <div className="bg-white text-black text-[8px] font-bold px-2 py-0.5 rounded-sm transform rotate-1">THIS IS CRAZY</div>
              </div>
            </div>
          </div>

        </div>
      </section>