"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Map as MapIcon, 
  Layers, 
  Filter, 
  MapPin, 
  LayoutList,
  Compass
} from "lucide-react";
import Link from "next/link";

const IssueMap = dynamic(() => import("@/components/IssueMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[75vh] bg-slate-50 animate-pulse rounded-3xl flex items-center justify-center border border-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Initializing Map Engine...</p>
      </div>
    </div>
  )
});

export default function ExploreMapPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues");
        const data = await res.json();
        setIssues(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching map data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 pt-28">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Compass className="w-4 h-4" />
            Live Civic Radar
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight font-headline">
            Live <span className="text-secondary">City Map</span>
          </h1>
          <p className="text-slate-500 max-w-xl font-light text-lg leading-relaxed">
            Real-time visual breakdown of ongoing civic issues. Navigate through sectors to monitor progress and community impact.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Link 
            href="/reports"
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-xs transition-all border border-slate-200 premium-shadow"
          >
            <LayoutList className="w-5 h-5 text-primary" />
            Switch to List
          </Link>
        </div>
      </div>

      {/* Main Map Engine */}
      <div className="mb-12">
        <IssueMap issues={issues} />
      </div>

      {/* Bottom Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 border-l-4 border-l-primary flex items-center justify-between premium-shadow">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">Total Active</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{issues.filter(i => !i.status.includes('resolved')).length} Reports</h4>
          </div>
          <MapPin className="w-10 h-10 text-slate-200" />
        </div>
        
        <div className="p-6 bg-white rounded-2xl border border-slate-100 border-l-4 border-l-amber-400 flex items-center justify-between premium-shadow">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">In Execution</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{issues.filter(i => i.status.includes('progress')).length} Solving</h4>
          </div>
          <Layers className="w-10 h-10 text-slate-200" />
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-100 border-l-4 border-l-secondary flex items-center justify-between col-span-1 md:col-span-2 premium-shadow">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">Resolution Engine</p>
            <h4 className="text-xl font-bold text-slate-900 leading-tight">Map icons are color-coded based on current resolution phase.</h4>
          </div>
          <Filter className="w-12 h-12 text-slate-200" />
        </div>
      </div>
    </div>
  );
}
