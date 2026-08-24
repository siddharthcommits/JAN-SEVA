"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Medal, 
  Star, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp,
  Award
} from "lucide-react";

export default function LeaderboardPage() {
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/authority/list");
        if (res.ok) {
          const data = await res.json();
          setAuthorities(data);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-10 h-10 text-amber-500" />;
      case 1: return <Medal className="w-8 h-8 text-slate-400" />;
      case 2: return <Medal className="w-8 h-8 text-orange-400" />;
      default: return <span className="text-xl font-extrabold text-slate-300">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return "border-amber-400 bg-white shadow-[0_0_40px_rgba(245,158,11,0.1)]";
      case 1: return "border-slate-300 bg-white shadow-xl";
      case 2: return "border-orange-300 bg-white shadow-xl";
      default: return "border-slate-100 bg-white";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 pt-28">
      {/* Header Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Award className="w-64 h-64 text-primary" />
        </div>
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <TrendingUp className="w-4 h-4" />
          Real-time Performance
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary tracking-tight font-headline mb-4">
          Official <span className="text-secondary">Leaderboard</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-light text-lg leading-relaxed">
          Celebrating the most active and efficient officials in city-wide civic resolution. 
          Ranked by performance points, resolution speed, and citizen satisfaction.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 items-end">
        {authorities.slice(0, 3).map((auth, index) => {
            const orderIndex = index === 0 ? 1 : index === 1 ? 0 : 2;
            const displayAuth = authorities[orderIndex] || auth;
            const displayIndex = orderIndex;

            return (
              <div 
                key={displayAuth.id} 
                className={`relative group ${displayIndex === 0 ? 'order-first md:order-none' : ''}`}
              >
                <div className={`p-8 rounded-3xl border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center premium-hover ${getRankColor(displayIndex)}`}>
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-3xl font-extrabold text-primary">
                      {displayAuth.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                       {getRankIcon(displayIndex)}
                    </div>
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-900 mb-1 group-hover:text-primary transition-colors font-headline">
                    {displayAuth.name}
                  </h3>
                  <p className="text-slate-500 font-medium text-xs mb-6">
                    {displayAuth.designation || displayAuth.department}
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full mb-8 pt-6 border-t border-slate-100">
                    <div>
                      <p className="text-slate-900 font-extrabold text-2xl">{displayAuth.totalPoints}</p>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Points</p>
                    </div>
                    <div>
                      <p className="text-slate-900 font-extrabold text-2xl">{displayAuth.completedTasks}</p>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Resolved</p>
                    </div>
                  </div>

                  <Link 
                    href={`/dashboard?officialId=${displayAuth.id}`}
                    className="w-full py-4 bg-primary hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    View Record
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
        })}
      </div>

      {/* List for the rest */}
      <div className="space-y-4">
        {authorities.slice(3).map((auth, index) => (
          <div 
            key={auth.id} 
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-all premium-hover"
          >
            <div className="flex items-center gap-4 flex-1 w-full">
              <div className="w-12 text-center font-extrabold text-slate-300 text-2xl tracking-tighter">
                #{index + 4}
              </div>
              <div className="w-14 h-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center font-bold text-primary">
                {auth.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{auth.name}</h4>
                <p className="text-sm font-medium text-slate-500">{auth.designation || "Civil Inspector"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-12 text-center w-full sm:w-auto justify-between sm:justify-end">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xl mb-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {auth.totalPoints}
                </div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Performance</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xl mb-1">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  {auth.completedTasks}
                </div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Efficiency</p>
              </div>
              <Link 
                href={`/dashboard?officialId=${auth.id}`}
                className="p-3 bg-slate-50 hover:bg-primary text-slate-600 hover:text-white rounded-xl transition-all"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ))}

        {authorities.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">New Session Ranking in Progress...</p>
          </div>
        )}
      </div>
    </div>
  );
}
