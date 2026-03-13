import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniAI | Algorithmic Growth Engine",
  description: "Enterprise content distribution and AI analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-[#0A0A0A]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}