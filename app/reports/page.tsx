"use client";

import React, { useState, useEffect, Suspense } from "react";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MessageSquare,
  Filter,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type IssueStatus = "Pending" | "In Progress" | "Resolved" | "Delayed";

interface Issue {
  id: string;
  title: string;
  category: string;
  status: IssueStatus;
  date: string;
  location: string;
  votes: number;
  authority: string;
  imageUrl?: string;
  comments: number;
}

function IssueFeedContent() {
  const [filter, setFilter] = useState<string>("All");
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("citizen");
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem("user_role");
    const uId = localStorage.getItem("user_id");
    setUserId(uId);
    
    if (role === "authority") {
      setUserRole("authority");
    }
    
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues");
        const data = await res.json();
        setIssues(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const handleVote = async (issueId: string, value: number) => {
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("user_role");

    if (role === "authority") {
      toast.error("Official accounts are restricted from public voting");
      return;
    }

    if (!userId) {
      toast.error("Authentication required to vote");
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch("/api/issues/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, userId, value })
      });
      if (res.ok) {
        toast.success(value > 0 ? "Upvoted" : "Downvoted");
        const refresh = await fetch(`/api/issues?t=${Date.now()}`);
        const data = await refresh.json();
        setIssues(Array.isArray(data) ? data : []);
      } else if (res.status === 429) {
        toast.error("30s Vote Cooldown");
      }
    } catch (err) {
      toast.error("Sync Error");
      console.error("Vote failed:", err);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("pending") || s === "filed") return "bg-slate-100 text-slate-600 border-slate-200";
    if (s.includes("progress")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (s.includes("resolved") || s.includes("verified") || s.includes("approved")) return "bg-emerald-50 text-secondary border-emerald-200";
    if (s.includes("delayed") || s.includes("rejected")) return "bg-red-50 text-red-600 border-red-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const filteredIssues = issues.filter((i: any) => {
    if (!mounted) return true;
    if (userRole === "authority") {
      if (i.authorityId !== userId) return false;
    }
    if (filter !== "All" && !i.status.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const matchString = `${i.title} ${i.category} ${i.locationAddress || ""} ${i.description || ""}`.toLowerCase();
      if (!matchString.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 pt-28">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary font-headline mb-2">
            {userRole === "authority" ? "Departmental Assignment Feed" : "Community Reports"}
          </h1>
          <p className="text-slate-500 font-light">
            {userRole === "authority" 
              ? "Review and address civic issues assigned to your department." 
              : "Browse, track, and vote on civic issues reported by citizens."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center text-sm font-medium text-slate-600">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            Filter:
          </div>
          <select
            className="bg-white border border-slate-200 rounded-xl text-sm py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="All">All Issues</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
      </div>
      
      {searchQuery && (
        <div className="mb-6 bg-primary/5 border border-primary/10 px-4 py-3 rounded-lg text-slate-900">
          <span className="text-primary font-bold">Showing results for: </span> 
          <span className="italic">"{searchQuery}"</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all group premium-hover"
          >
            {/* Image Section */}
            <div className="w-full md:w-80 h-56 md:h-64 bg-slate-100 relative shrink-0 overflow-hidden">
              <div className="absolute top-3 left-3 z-10">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm uppercase tracking-wider ${getStatusColor(issue.status)}`}
                >
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              {issue.photoUrl ? (
                <img 
                  src={issue.photoUrl} 
                  alt="Report Illustration" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.png";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  No Image
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full">
                  {issue.category}
                </span>
                <span className="flex items-center text-sm text-slate-500">
                  <Clock className="w-4 h-4 mr-1.5" />
                  Reported {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </div>

              <Link href={`/reports/${issue.id}`} className="block" target="_blank">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  {issue.title}
                </h3>
              </Link>

              <div className="flex items-center text-sm text-slate-600 mb-4">
                <MapPin className="w-4 h-4 mr-1.5 shrink-0 text-primary" />
                <span className="truncate">{issue.locationAddress || "Specified Location"}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  {userRole === "citizen" ? (
                    <div className="flex items-center bg-slate-50 rounded-full border border-slate-200">
                      <button
                        onClick={() => handleVote(issue.id, 1)}
                        className="p-2 text-slate-500 hover:text-secondary hover:bg-secondary/10 rounded-l-full transition-colors"
                        title="Upvote"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-bold text-sm text-slate-900 min-w-[3rem] text-center border-x border-slate-200">
                        {issue.votes?.reduce((acc: number, v: any) => acc + v.value, 0) || 0}
                      </span>
                      <button
                        onClick={() => handleVote(issue.id, -1)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-r-full transition-colors"
                        title="Downvote"
                      >
                        <ThumbsDown className="w-4 h-4 mt-1" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                       <ThumbsUp className="w-3 h-3" />
                       {issue.votes?.reduce((acc: number, v: any) => acc + v.value, 0) || 0} Priority Points
                    </div>
                  )}

                  <Link href={`/reports/${issue.id}`} target="_blank" className="flex items-center text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer">
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    {issue.comments?.length || 0} Comments
                  </Link>
                </div>

                <div className="text-sm">
                  <span className="text-slate-500 font-medium">Assigned to: </span>
                  <span className="font-bold text-slate-900">
                    {issue.authority?.name || "Assigning Official..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              No reports found
            </h3>
            <p className="text-slate-500 font-light">
              No issues match the selected filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IssueFeedPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <IssueFeedContent />
    </Suspense>
  );
}
