"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export default function NavbarClient() {
  const { isSignedIn } = useAuth();

  return (
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
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative py-1 transition-colors hover:text-zinc-50 group"
              >
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
                <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors">
                  Start Building
                </button>
              </SignUpButton>
            </>
          )}
          {isSignedIn && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block mr-2"
              >
                Go to Dashboard
              </Link>
              <UserButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}