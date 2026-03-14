"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignUpButton, useAuth } from "@clerk/nextjs";

export default function HeroActions() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      {!isSignedIn ? (
        <SignUpButton mode="modal">
          <button className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
            Get API Keys
            <ArrowRight className="w-4 h-4" />
          </button>
        </SignUpButton>
      ) : (
        <Link
          href="/dashboard"
          className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          Go to Dashboard
        </Link>
      )}
      <button className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
        Read the Docs
      </button>
    </div>
  );
}