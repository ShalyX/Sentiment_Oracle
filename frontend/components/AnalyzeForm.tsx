"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAnalyzeText, useSingleSentiment } from "@/lib/hooks/useSentimentOracle";
import { useWallet } from "@/lib/genlayer/wallet";
import { Loader2, Sparkles, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AnalyzeForm() {
  const [text, setText] = useState("");
  const [lastAnalyzedText, setLastAnalyzedText] = useState<string | null>(null);
  const { analyzeText, isAnalyzing, isSuccess, extractedSentiment } = useAnalyzeText();
  const { isConnected, connectWallet } = useWallet();
  
  // Fetch result for the specific text we just analyzed
  const { data: contractSentiment, isLoading: isFetchingResult } = useSingleSentiment(lastAnalyzedText);

  // Determine the effective sentiment (extracted from receipt OR from contract)
  const sentiment = extractedSentiment || contractSentiment;
  const isPendingConsensus = isAnalyzing || (isFetchingResult && (!sentiment || sentiment === "NOT_FOUND"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;
    
    if (!isConnected) {
      connectWallet();
      return;
    }

    setLastAnalyzedText(trimmedText);
    analyzeText(trimmedText);
    setText("");
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Analyze Sentiment
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text for AI-powered sentiment analysis..."
              className={cn(
                "w-full min-h-[120px] p-4 rounded-xl transition-all duration-300",
                "bg-white/5 border border-white/10 hover:border-accent/50 focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none",
                "placeholder:text-muted-foreground/50 resize-none text-lg text-white/90",
                "group-hover:bg-white/10"
              )}
              disabled={isAnalyzing}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground pointer-events-none">
              {text.length} characters
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Info className="w-3 h-3 text-accent" />
              <span>Consensus will be reached via LLM validators</span>
            </div>
            
            <Button
              type="submit"
              disabled={isAnalyzing || !text.trim()}
              className={cn(
                "h-12 px-8 rounded-full font-bold transition-all duration-500",
                "bg-accent hover:bg-accent/80 hover:scale-105 active:scale-95 shadow-lg shadow-accent/20",
                "disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : isConnected ? (
                "Analyze Now"
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Last Result Mini-Card */}
      {lastAnalyzedText && (
        <div className="glass-card p-4 border-accent/20 bg-accent/5 animate-in slide-in-from-top-2 duration-500 shadow-xl shadow-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                {isPendingConsensus ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-0.5 opacity-80">
                  Last Oracle Scan
                </p>
                <p className="text-sm text-white/90 truncate font-medium max-w-[200px] md:max-w-[400px]">
                  "{lastAnalyzedText}"
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-4">
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              {isPendingConsensus ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5 animate-pulse">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Awaiting Consensus</span>
                </div>
              ) : (
                <SentimentResultBadge sentiment={sentiment!} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SentimentResultBadge({ sentiment }: { sentiment: string }) {
  const s = sentiment.toUpperCase();
  
  if (s === "POSITIVE") {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50 px-4 py-1.5 text-xs font-black shadow-lg shadow-emerald-500/10">
        POSITIVE
      </Badge>
    );
  }
  
  if (s === "NEGATIVE") {
    return (
      <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/50 px-4 py-1.5 text-xs font-black shadow-lg shadow-rose-500/10">
        NEGATIVE
      </Badge>
    );
  }
  
  if (s === "NEUTRAL") {
    return (
      <Badge className="bg-sky-500/20 text-sky-500 border-sky-500/50 px-4 py-1.5 text-xs font-black shadow-lg shadow-sky-500/10">
        NEUTRAL
      </Badge>
    );
  }

  return <Badge variant="outline" className="px-3 py-1">{s}</Badge>;
}
