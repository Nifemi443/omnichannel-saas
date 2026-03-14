"use client";

import Link from "next/link";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { Zap, Globe, Crown, Check, ArrowUpRight, Star } from "lucide-react";

const HOBBY_FEATURES = ["60 min AI processing / mo", "720p video exports", "Standard AI captions", "Community Discord"];
const PRO_FEATURES = ["100 hrs AI processing / mo", "4K video exports", "Custom brand fonts & colors", "Priority API access", "Remove watermarks"];
const AGENCY_FEATURES = ["Unlimited AI processing", "Highest priority queue", "White-label dashboard", "Dedicated account manager", "Custom AI fine-tuning"];

export default function PricingSection() {
  const { isSignedIn } = useAuth();

  return (
    <section id="pricing" className="relative z-10 py-32 px-6 border-t border-white/5 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-[100%] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-20">
          <p className="text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-indigo-500 inline-block" />
            Pricing
            <span className="w-8 h-[1px] bg-indigo-500 inline-block" />
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-5 leading-[0.95]">
            Simple.<br /><span className="text-zinc-500">Transparent.</span>
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto text-base">
            Start free, scale when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Hobby */}
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
              {HOBBY_FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-zinc-400">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-zinc-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            {isSignedIn ? (
              <Link href="/dashboard" className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 group/btn">
                Go to Dashboard <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 group/btn">
                  Get Started Free <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                </button>
              </SignUpButton>
            )}
          </div>

          {/* Pro */}
          <div className="relative rounded-3xl border border-indigo-500/25 bg-zinc-950/80 backdrop-blur-sm p-8 flex flex-col overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-[0_0_80px_-20px_rgba(99,102,241,0.4)] group md:-translate-y-2">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
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
              {PRO_FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-zinc-200">
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

          {/* Agency */}
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
              {AGENCY_FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-zinc-400">
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

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-zinc-600 text-xs">
          {["No credit card required", "Cancel anytime", "SOC 2 compliant", "99.9% uptime SLA"].map((item, i, arr) => (
            <>
              <span key={item} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-500" /> {item}
              </span>
              {i < arr.length - 1 && <span className="w-[1px] h-3 bg-zinc-800 hidden sm:block" />}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}