"use client";

import { useSentimentResults } from "@/lib/hooks/useSentimentOracle";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResultsList() {
  const { data: results, isLoading, error } = useSentimentResults();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-muted-foreground animate-pulse">Fetching global results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center glass-card border-destructive/50">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-bold">Failed to load results</h3>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Global Analyses
          {results && results.length > 0 && (
            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent">
              {results.length}
            </span>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {results?.map((result, index) => (
          <div
            key={index}
            className="group relative glass-card p-6 border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 animate-in fade-in slide-in-from-left-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-grow space-y-2">
                <p className="text-lg leading-relaxed text-white/90">
                  "{result.text}"
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Finalized on GenLayer
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-3">
                <SentimentBadge sentiment={result.sentiment} />
                <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {(!results || results.length === 0) && (
          <div className="text-center p-12 glass-card opacity-50">
            <p className="text-muted-foreground italic">No analyses yet. Be the first to analyze text!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const s = sentiment.toUpperCase();
  
  if (s === "POSITIVE") {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50 px-3 py-1 text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all hover:scale-110">
        POSITIVE
      </Badge>
    );
  }
  
  if (s === "NEGATIVE") {
    return (
      <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/50 px-3 py-1 text-sm font-bold shadow-lg shadow-rose-500/10 transition-all hover:scale-110">
        NEGATIVE
      </Badge>
    );
  }
  
  if (s === "NEUTRAL") {
    return (
      <Badge className="bg-sky-500/20 text-sky-500 border-sky-500/50 px-3 py-1 text-sm font-bold shadow-lg shadow-sky-500/10 transition-all hover:scale-110">
        NEUTRAL
      </Badge>
    );
  }

  return <Badge variant="outline" className="px-3 py-1">{s}</Badge>;
}
