"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  PlusCircle,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  CheckCircle,
  Camera,
  MessageSquare,
  Share2,
  Send,
  Loader2,
  TrendingUp,
  Compass,
  Home,
  FileText,
  Settings,
  Shield,
  Zap,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/* ─── Types ─── */
type SortMode = "new" | "top" | "upvoted" | "unresolved";

/* ─── Helpers ─── */
const timeSince = (dateStr: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const categoryColorMap: Record<string, { bg: string; text: string }> = {
  "Roads & Potholes": { bg: "bg-orange-100", text: "text-orange-700" },
  "Sanitation & Garbage": { bg: "bg-green-100", text: "text-green-700" },
  "Street Lighting": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "Water & Leakage": { bg: "bg-blue-100", text: "text-blue-700" },
  "Parks & Public Spaces": { bg: "bg-lime-100", text: "text-lime-700" },
  "Traffic & Safety": { bg: "bg-red-100", text: "text-red-700" },
  "Drains & Sewage": { bg: "bg-purple-100", text: "text-purple-700" },
  Other: { bg: "bg-slate-100", text: "text-slate-700" },
};

const statusColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  filed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  pending: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  assigned: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  resolved: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  verified: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  delayed: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

/* ─── Issue Card (Reddit‑style, matches frontend IssueCard) ─── */
function IssueCard({ issue, userRole }: { issue: any; userRole: string }) {
  const [votes, setVotes] = useState(
    Array.isArray(issue.votes)
      ? issue.votes.reduce((a: number, v: any) => a + v.value, 0)
      : 0
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(issue.comments || []);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const router = useRouter();

  const catColors = categoryColorMap[issue.category] || { bg: "bg-slate-100", text: "text-slate-700" };
  const sColors = statusColorMap[issue.status] || statusColorMap.filed;

  const handleVote = async (value: number) => {
    if (userRole === "authority") {
      toast.error("Officials cannot vote");
      return;
    }
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("Login required to vote");
      return;
    }
    try {
      const res = await fetch("/api/issues/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: issue.id, userId, value }),
      });
      if (res.ok) {
        setVotes((v: number) => v + value);
        toast.success(value > 0 ? "Upvoted" : "Downvoted");
      } else if (res.status === 429) {
        toast.error("30s cooldown");
      }
    } catch {
      toast.error("Vote failed");
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setShowComments(true);
      if (comments.length === 0) {
        setLoadingComments(true);
        try {
          const res = await fetch(`/api/issues/${issue.id}/comments`);
          const data = await res.json();
          setComments(data.comments || []);
        } catch {
          /* silent */
        } finally {
          setLoadingComments(false);
        }
      }
    } else {
      setShowComments(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("Login required");
      return;
    }
    setPostingComment(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: commentText.trim(), isOfficial: userRole === "authority" }),
      });
      if (res.ok) {
        const refresh = await fetch(`/api/issues/${issue.id}`);
        const updated = await refresh.json();
        setComments(updated.comments || []);
        setCommentText("");
        toast.success("Comment posted");
      }
    } catch {
      toast.error("Failed to post");
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <article className="flex bg-white rounded-[2rem] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,30,64,0.06)] group hover:-translate-y-0.5 transition-all duration-300 w-full flex-col border border-slate-100">
      <div className="flex flex-col sm:flex-row">
        {/* Voting Sidebar */}
        <div className="sm:w-16 bg-slate-50 flex sm:flex-col items-center py-4 sm:py-6 px-6 sm:px-0 gap-4 sm:gap-1 justify-between sm:justify-start border-b sm:border-b-0 sm:border-r border-slate-100">
          <div className="flex sm:flex-col items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-full transition-colors text-slate-400"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-primary text-sm">{votes}</span>
            <button
              onClick={() => handleVote(-1)}
              className="p-2 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors text-slate-400"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
          <div className="sm:hidden text-xs text-slate-500 font-medium">
            {timeSince(issue.createdAt)}
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-1 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`${catColors.bg} ${catColors.text} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                {issue.category}
              </span>
              <span className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                <MapPin className="w-3 h-3" />
                {issue.locationAddress || "Local Area"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 ${sColors.bg} ${sColors.text} px-3 py-1 rounded-full text-xs font-bold`}>
                <span className={`w-2 h-2 rounded-full ${sColors.dot}`}></span>
                {issue.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <Link href={`/reports/${issue.id}`} target="_blank">
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 leading-tight group-hover:text-secondary transition-colors cursor-pointer">
              {issue.title}
            </h3>
          </Link>
          <p className="text-slate-600 mb-6 leading-relaxed text-sm sm:text-base line-clamp-3">
            {issue.description}
          </p>

          {issue.photoUrl && (
            <div className="relative rounded-3xl overflow-hidden mb-6 aspect-video bg-slate-100">
              <img
                src={issue.photoUrl}
                alt={issue.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-slate-100 gap-4">
            <div className="flex items-center gap-5 text-slate-500">
              <button
                onClick={toggleComments}
                className={`flex items-center gap-2 transition-colors text-sm font-semibold ${showComments ? "text-primary" : "hover:text-primary"}`}
              >
                <MessageSquare className="w-4 h-4" />
                {comments.length || issue.comments?.length || 0} Comments
              </button>
              <button className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-semibold">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Reported by {issue.anonymousUsername || "Anonymous"} • {timeSince(issue.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Comment Section */}
      {showComments && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <form onSubmit={handlePostComment} className="p-6 flex gap-3 border-b border-slate-100">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
            <button
              type="submit"
              disabled={postingComment || !commentText.trim()}
              className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40"
            >
              {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </form>

          <div className="px-6 py-4 space-y-4 max-h-80 overflow-y-auto">
            {loadingComments ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {comment.firstName?.charAt(0)?.toUpperCase() || comment.user?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {comment.user || "Citizen"}
                      </span>
                      {comment.isOfficial && (
                        <span className="text-[8px] font-bold text-white bg-secondary px-1.5 py-0.5 rounded uppercase">
                          Official
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{timeSince(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-400 py-4">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* ─── Citizen Sidebar ─── */
function CitizenSidebar() {
  return (
    <aside className="hidden lg:block py-4">
      <div className="sticky top-28 flex flex-col gap-1">
        <div className="px-4 py-2 mb-4">
          <h2 className="text-lg font-bold text-primary">Citizen Portal</h2>
          <p className="text-xs text-slate-500">Jan Seva Civic Tech</p>
        </div>

        <Link href="/dashboard" className="flex items-center gap-3 bg-secondary/10 text-secondary rounded-xl px-4 py-3 hover:translate-x-1 transition-transform font-medium text-sm">
          <Home className="w-5 h-5" />
          Home
        </Link>
        <Link href="/reports" className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform font-medium text-sm">
          <TrendingUp className="w-5 h-5" />
          Popular
        </Link>
        <Link href="/map" className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform font-medium text-sm">
          <Compass className="w-5 h-5" />
          Explore Map
        </Link>
        <Link href="/reports" className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform font-medium text-sm">
          <FileText className="w-5 h-5" />
          My Reports
        </Link>
        <Link href="/profile" className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform font-medium text-sm">
          <Settings className="w-5 h-5" />
          Settings
        </Link>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="px-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Support</p>
          <a className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-primary transition-colors text-xs" href="#">
            <Shield className="w-4 h-4" />
            Privacy
          </a>
          <a className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-primary transition-colors text-xs" href="#">
            <FileText className="w-4 h-4" />
            Terms
          </a>
        </div>
      </div>
    </aside>
  );
}

/* ─── Trending Sidebar ─── */
function TrendingSidebar({ issues }: { issues: any[] }) {
  const trending = [...issues]
    .sort((a, b) => {
      const aVotes = Array.isArray(a.votes) ? a.votes.reduce((s: number, v: any) => s + v.value, 0) : 0;
      const bVotes = Array.isArray(b.votes) ? b.votes.reduce((s: number, v: any) => s + v.value, 0) : 0;
      return bVotes - aVotes;
    })
    .slice(0, 5);

  const categoryIcons: Record<string, string> = {
    "Roads & Potholes": "🛣️",
    "Sanitation & Garbage": "🗑️",
    "Water & Leakage": "💧",
    "Street Lighting": "⚡",
    "Drains & Sewage": "🚰",
    "Parks & Public Spaces": "🌳",
    "Traffic & Safety": "🚦",
    Other: "📋",
  };

  return (
    <aside className="hidden lg:block py-4 space-y-8">
      {/* Location Card */}
      <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Current Ward</p>
            <h4 className="text-xl font-bold leading-tight">Your Area</h4>
          </div>
          <Compass className="w-6 h-6 text-blue-300" />
        </div>
        <Link
          href="/map"
          className="block w-full text-center bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md text-sm"
        >
          Explore Map
        </Link>
      </div>

      {/* Trending Issues */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h4 className="text-sm font-extrabold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4 text-secondary" />
          Trending Issues
        </h4>
        <div className="space-y-6">
          {trending.length > 0 ? (
            trending.map((issue, i) => (
              <Link key={issue.id} href={`/reports/${issue.id}`} className="flex gap-4 group cursor-pointer">
                <span className="text-2xl font-extrabold text-slate-200 group-hover:text-secondary transition-colors w-8 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary line-clamp-1">
                    {categoryIcons[issue.category] || "📋"} {issue.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {Array.isArray(issue.votes) ? issue.votes.reduce((s: number, v: any) => s + v.value, 0) : 0} Upvotes
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center">No trending issues</p>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
        <h4 className="text-sm font-extrabold text-primary uppercase tracking-widest mb-6">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          {Object.keys(categoryColorMap).map((cat) => (
            <button key={cat} className="px-3 py-2 bg-white text-slate-700 text-[10px] font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm border border-slate-100">
              {cat}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ─── Authority Panel (kept for officials) ─── */
function AuthorityPanel({
  stats,
  issues,
  userRole,
}: {
  stats: any;
  issues: any[];
  userRole: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const pendingIssues = issues.filter(
    (i) => !["resolved", "approved", "verified"].includes(i.status?.toLowerCase())
  );
  const resolvedIssues = issues.filter((i) =>
    ["resolved", "approved", "verified"].includes(i.status?.toLowerCase())
  );

  const [tab, setTab] = useState<"pending" | "resolved">("pending");
  const display = tab === "pending" ? pendingIssues : resolvedIssues;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl premium-shadow border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Critical Pending</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.pendingCritical || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl premium-shadow border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg. Resolution</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.avgResolutionTime || "0d"}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl premium-shadow border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-secondary rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Resolved This Week</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.resolvedThisWeek || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs + Cards */}
      <div className="bg-white rounded-2xl premium-shadow border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setTab("pending")}
            className={`px-6 py-4 text-sm font-bold relative ${tab === "pending" ? "text-secondary bg-secondary/5" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Action Required ({pendingIssues.length})
            {tab === "pending" && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-secondary" />}
          </button>
          <button
            onClick={() => setTab("resolved")}
            className={`px-6 py-4 text-sm font-bold relative ${tab === "resolved" ? "text-secondary bg-secondary/5" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Resolved ({resolvedIssues.length})
            {tab === "resolved" && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-secondary" />}
          </button>
        </div>
        <div className="p-6 space-y-4">
          {display.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No issues in this section</p>
            </div>
          ) : (
            display.map((issue) => (
              <IssueCard key={issue.id} issue={issue} userRole={userRole} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard (wrapped with Suspense for searchParams) ─── */
function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOfficialId = searchParams.get("officialId");

  const [viewRole, setViewRole] = useState<"citizen" | "authority">("citizen");
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [authorityIssues, setAuthorityIssues] = useState<any[]>([]);
  const [authorityStats, setAuthorityStats] = useState<any>({});
  const [sortMode, setSortMode] = useState<SortMode>("new");
  const [usingGeo, setUsingGeo] = useState(false);

  /* Auth + Role init */
  useEffect(() => {
    if (queryOfficialId) {
      setViewRole("authority");
      return;
    }
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("Please login to access your dashboard");
      router.push("/auth/login?redirect=/dashboard");
      return;
    }
    const saved = localStorage.getItem("user_role") as "citizen" | "authority";
    if (saved === "authority") setViewRole("authority");
  }, [queryOfficialId, router]);

  /* Fetch issues */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userId =
        queryOfficialId ||
        localStorage.getItem("user_id") ||
        (viewRole === "citizen" ? "citizen_4729" : "auth_prem_singh");

      try {
        if (viewRole === "citizen") {
          // Fetch all issues for the feed
          const res = await fetch("/api/issues");
          const data = await res.json();
          if (Array.isArray(data)) {
            setIssues(data);
          }
        } else {
          // Authority mode
          const statsRes = await fetch(`/api/authority/${userId}/stats`);
          const statsData = await statsRes.json();
          setAuthorityStats(statsData);

          const tasksRes = await fetch(`/api/tasks/official?officialId=${userId}`);
          const tasksData = await tasksRes.json();
          if (Array.isArray(tasksData)) {
            setAuthorityIssues(
              tasksData.map((t: any) => ({
                ...t.issue,
                taskId: t.id,
                status: t.status,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewRole, queryOfficialId]);

  /* Sort + filter */
  const sortedIssues = React.useMemo(() => {
    let list = [...issues];
    switch (sortMode) {
      case "top":
      case "upvoted":
        list.sort((a, b) => {
          const aV = Array.isArray(a.votes) ? a.votes.reduce((s: number, v: any) => s + v.value, 0) : 0;
          const bV = Array.isArray(b.votes) ? b.votes.reduce((s: number, v: any) => s + v.value, 0) : 0;
          return bV - aV;
        });
        break;
      case "unresolved":
        list = list.filter((i) => !["resolved", "approved", "verified"].includes(i.status));
        break;
      case "new":
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [issues, sortMode]);

  const sortButtons: { mode: SortMode; label: string }[] = [
    { mode: "new", label: "New" },
    { mode: "top", label: "Top" },
    { mode: "upvoted", label: "Upvoted" },
    { mode: "unresolved", label: "Unresolved" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  /* ─── Authority view ─── */
  if (viewRole === "authority") {
    return (
      <div className="max-w-7xl mx-auto pt-20 sm:pt-24 px-4 sm:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-headline mb-2">
              Authority Management Panel
            </h1>
            <p className="text-slate-500 font-light">Review assigned issues and update resolutions.</p>
          </div>
          <button
            onClick={() => {
              const actualRole = localStorage.getItem("user_role");
              if (actualRole !== "authority") {
                toast.error("Official credentials required");
                return;
              }
              router.push("/report");
            }}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:brightness-105 transition-all text-sm"
          >
            <Camera className="w-5 h-5" />
            Field Resolution
          </button>
        </div>
        <AuthorityPanel stats={authorityStats} issues={authorityIssues} userRole="authority" />
      </div>
    );
  }

  /* ─── Citizen view: 3-column layout matching frontend ─── */
  return (
    <div className="max-w-screen-2xl mx-auto pt-20 sm:pt-24 px-4 sm:px-8 grid grid-cols-12 gap-4 sm:gap-8 min-h-screen">
      <Toaster position="top-right" />

      {/* Left Sidebar */}
      <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
        <CitizenSidebar />
      </div>

      {/* Center Feed */}
      <div className="col-span-12 lg:col-span-6 xl:col-span-7 py-4">
        {/* Geo indicator */}
        {usingGeo && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
            <MapPin className="w-4 h-4" />
            Showing issues near your location
          </div>
        )}

        {/* Sort Tabs */}
        <div className="flex items-center justify-between mb-8 p-1 bg-slate-50 rounded-2xl w-full overflow-x-auto border border-slate-100">
          <div className="flex gap-1 overflow-x-auto min-w-max">
            {sortButtons.map((btn) => (
              <button
                key={btn.mode}
                onClick={() => setSortMode(btn.mode)}
                className={`px-6 py-2.5 font-medium rounded-xl transition-all whitespace-nowrap text-sm ${
                  sortMode === btn.mode
                    ? "bg-white text-primary font-bold shadow-sm"
                    : "text-slate-500 hover:bg-slate-200/50"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report FAB */}
        <div className="mb-8">
          <button
            onClick={() => {
              const userId = session?.user?.email || localStorage.getItem("user_id");
              if (!userId) {
                toast.error("Please login to report an issue");
                router.push("/auth/login?redirect=/report");
              } else {
                router.push("/report");
              }
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-md text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Report New Issue
          </button>
        </div>

        {/* Issue Cards */}
        <div className="flex flex-col gap-8 w-full">
          {sortedIssues.length > 0 ? (
            sortedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} userRole="citizen" />
            ))
          ) : (
            <div className="text-center p-8 bg-slate-50 rounded-3xl text-slate-500 border border-slate-100">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              No issues found. Be the first to report!
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block lg:col-span-3 xl:col-span-3">
        <TrendingSidebar issues={issues} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
