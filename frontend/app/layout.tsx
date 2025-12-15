import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { FloatingDock } from "@/components/FloatingDock";
import PageTransition from "@/components/PageTransition";
import OracleInterface from "@/components/OracleInterface";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import FortuneWheel from "@/components/FortuneWheel";
import MorphingBlobs from "@/components/MorphingBlobs";
import VoiceCommands from "@/components/VoiceCommands";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Lifestyle Flagship",
  description: "Your personal AI ecosystem for holistic growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased bg-neutral-950 text-white min-h-screen`}
      >
        <div className="relative z-10">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        <FloatingDock />
        <OracleInterface />
        <KeyboardShortcuts />
        <FortuneWheel />
        <MorphingBlobs />
        <VoiceCommands />
      </body>
    </html>
  );
}
