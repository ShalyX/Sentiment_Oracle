"use client";

import { Navbar } from "@/components/Navbar";
import { AnalyzeForm } from "@/components/AnalyzeForm";
import { ResultsList } from "@/components/ResultsList";
import { StatsLeaderboard } from "@/components/StatsLeaderboard";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-accent selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Hero Section */}
          <section className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold tracking-wider uppercase mb-4 animate-pulse">
              <Zap className="w-4 h-4" />
              AI-Native Consenus Protocol
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              Sentiment <span className="text-accent underline decoration-accent/30 underline-offset-8">Oracle</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground/80 font-medium leading-relaxed">
              An AI-native decentralized oracle that leverages the Equivalence Principle 
              to reach deterministic consensus on subjective sentiments.
            </p>
          </section>

          {/* Core Interaction Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Input & Stats */}
            <div className="lg:col-span-4 space-y-8 h-full">
              <AnalyzeForm />
              <StatsLeaderboard />
            </div>

            {/* Right: History */}
            <div className="lg:col-span-8 h-full">
              <ResultsList />
            </div>
          </div>

          {/* Technical Info Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-white/5 animate-slide-up">
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
              title="Equivalence Principle"
              description="Validators execute non-deterministic LLM prompts independently and reach consensus on results."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-400" />}
              title="Real-time Consensus"
              description="Fast polling and state transitions ensure sentiment labels are finalized within seconds."
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6 text-accent" />}
              title="AI-Native Security"
              description="Protocol-level protection against prompt injection and validator collusion."
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 hover:opacity-100 transition-opacity">
            <div className="text-sm font-medium">
              © 2026 Sentiment Oracle. Powered by <span className="text-accent">GenLayer Studionet</span>.
            </div>
            <div className="flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
              <FooterLink href="https://genlayer.com" label="GenLayer" />
              <FooterLink href="https://studio.genlayer.com" label="Studio" />
              <FooterLink href="https://docs.genlayer.com" label="Docs" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
      <div className="mb-4 p-3 bg-black rounded-xl inline-block group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-lg font-black mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FooterLink({ href, label }: { href: string, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="hover:text-accent transition-colors"
    >
      {label}
    </a>
  );
}
