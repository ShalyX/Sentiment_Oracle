"use client";

import { useSentimentResults } from "@/lib/hooks/useSentimentOracle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function StatsLeaderboard() {
  const { data: results, isLoading } = useSentimentResults();

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { 
      positive: 0, 
      negative: 0, 
      neutral: 0, 
      total: 0,
      mostCommon: "N/A"
    };

    const total = results.length;
    const counts = results.reduce((acc, r) => {
      const s = r.sentiment.toUpperCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pos = counts["POSITIVE"] || 0;
    const neg = counts["NEGATIVE"] || 0;
    const neu = counts["NEUTRAL"] || 0;

    const max = Math.max(pos, neg, neu);
    let mostCommon = "NEUTRAL";
    if (pos === max) mostCommon = "POSITIVE";
    if (neg === max) mostCommon = "NEGATIVE";

    return {
      positive: (pos / total) * 100,
      negative: (neg / total) * 100,
      neutral: (neu / total) * 100,
      total,
      mostCommon
    };
  }, [results]);

  if (isLoading) {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center space-y-4">
        <Activity className="w-8 h-8 text-accent animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm">Analyzing global trends...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Global Trends
          <div className="px-2 py-1 bg-accent/10 rounded-full">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
        </h2>
      </div>

      <div className="space-y-6">
        {/* Total Analyses Stat */}
        <div className="relative group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total consensus reached</p>
              <h3 className="text-3xl font-black text-white">{stats.total}</h3>
            </div>
            <BarChart3 className="w-8 h-8 text-accent/40 group-hover:text-accent transition-colors" />
          </div>
        </div>

        {/* Sentiment Progress Bars */}
        <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <StatBar label="Positive" value={stats.positive} color="bg-emerald-500" />
          <StatBar label="Negative" value={stats.negative} color="bg-rose-500" />
          <StatBar label="Neutral" value={stats.neutral} color="bg-sky-500" />
        </div>

        {/* Most Common Sentiment */}
        <div className="p-4 rounded-xl bg-accent gradient-subtle overflow-hidden relative group">
          <div className="relative z-10">
            <p className="text-xs text-black/60 font-bold uppercase tracking-wider mb-1">Dominant Sentiment</p>
            <h3 className="text-2xl font-black text-black">{stats.mostCommon}</h3>
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <PieChart className="w-12 h-12 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-white">{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div 
          className={cn("h-full transition-all duration-1000 ease-out", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
