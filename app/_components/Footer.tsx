import Link from "next/link";

const LINKS = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Developers: ["API Docs", "SDK", "Webhooks", "Status"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Terms", "Privacy", "Security", "Cookies"],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#0A0A0A] pt-20 pb-10 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
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
              {[
                { label: "𝕏", ariaLabel: "X (Twitter)" },
                { label: "in", ariaLabel: "LinkedIn" },
                { label: "gh", ariaLabel: "GitHub" },
              ].map(({ label, ariaLabel }) => (
                <Link
                  key={label}
                  href="#"
                  aria-label={ariaLabel}
                  // ── Fix: border-white/8 is invalid Tailwind; use /[0.08] ──
                  className="w-8 h-8 rounded-lg border border-white/[0.08] bg-zinc-900/60 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all text-xs font-bold"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([cat, items]) => (
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

        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

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