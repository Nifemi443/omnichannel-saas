import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-zinc-50 relative selection:bg-indigo-500/30">
      
      {/* SUBTLE BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* MINIMALIST ENTERPRISE NAVBAR */}
      <nav className="fixed top-0 inset-x-0 h-16 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-semibold tracking-tight text-lg flex items-center gap-2">
              <div className="size-5 rounded-md bg-white flex items-center justify-center">
                <div className="size-2.5 bg-black rounded-sm" />
              </div>
              Omni
            </span>
            <div className="hidden md:flex gap-8 text-sm text-zinc-400 font-medium">
              <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
              <Link href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="#login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors">
              Start Building
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-40 pb-20 flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">
        
        {/* STATUS BADGE */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-300 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
          Omnichannel Engine v2.0
        </div>

        {/* REFINED TYPOGRAPHY */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6 leading-[1.1]">
          The infrastructure for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
             algorithmic growth.
          </span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mb-10 font-light leading-relaxed">
          An enterprise-grade engine that transcribes, analyzes, and distributes your content across YouTube, TikTok, and web simultaneously.
        </p>

        {/* PROFESSIONAL CALL TO ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
            Get API Keys
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </button>
          <button className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
            Read the Docs
          </button>
        </div>
      </section>
      
    </main>
  );
}