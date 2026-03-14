import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omni AI | Algorithmic Growth Engine",
  description: "The infrastructure for algorithmic growth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-[#0A0A0A] text-zinc-50 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}