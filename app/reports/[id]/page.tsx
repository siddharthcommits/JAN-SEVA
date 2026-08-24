"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  MapPin,
  Map as MapIcon,
  Clock,
  ShieldCheck,
  MessageSquare,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  AlertTriangle,
  Send,
  Camera,
  CheckCircle,
  User,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getStaticMapUrl } from "@/lib/maps";

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pending") || s === "filed") return "bg-slate-100 text-slate-600 border-slate-200";
  if (s.includes("progress")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("resolved") || s.includes("verified") || s.includes("approved")) return "bg-emerald-50 text-secondary border-emerald-200";
  if (s.includes("delayed") || s.includes("rejected")) return "bg-red-50 text-red-600 border-red-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const getStatusIcon = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pending") || s === "filed") return <Clock className="w-5 h-5" />;
  if (s.includes("progress")) return <AlertTriangle className="w-5 h-5" />;
  if (s.includes("resolved") || s.includes("verified") || s.includes("approved")) return <ShieldCheck className="w-5 h-5" />;
  return <Clock className="w-5 h-5" />;
};

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [demoRole, setDemoRole] = useState<"citizen" | "authority">("citizen");
  const [updating, setUpdating] = useState(false);
  const [resolutionPhoto, setResolutionPhoto] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInitial, setUserInitial] = useState("C");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDemo = localStorage.getItem("demo_logged_in") === "true";
    setIsAuthenticated(!!session || isDemo);
    
    const role = localStorage.getItem("user_role");
    setUserRole(role);
    if (role === "authority") {
      setDemoRole("authority");
    }

    const name = session?.user?.name || localStorage.getItem("user_name");
    if (name) {
      setUserInitial(name[0]);
    }
  }, [session]);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${params.id}`);
        const data = await res.json();
        setIssue(data);
      } catch (error) {
        console.error("Error fetching issue:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [params.id]);

  const handleVote = async (value: number) => {
    const role = localStorage.getItem("user_role");
    if (role === "authority") {
      toast.error("Official accounts are not permitted to vote");
      return;
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("Authentication required to vote");
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch("/api/issues/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: params.id, userId, value })
      });
      if (res.ok) {
        toast.success(value > 0 ? "Upvoted!" : "Downvoted!");
        const refresh = await fetch(`/api/issues/${params.id}?t=${Date.now()}`);
        const updatedIssue = await refresh.json();
        if (updatedIssue && updatedIssue.id) {
          setIssue(updatedIssue);
        }
      } else if (res.status === 429) {
        toast.error("Cooldown: 30s");
      }
    } catch (err) {
      toast.error("Network sync failed");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || updating) return;
    
    const role = localStorage.getItem("user_role");
    if (role === "authority") {
      toast.error("Official accounts are restricted from public commenting");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to join the discussion");
      router.push(`/auth/login?redirect=/reports/${params.id}`);
      return;
    }

    const userId = session?.user?.email || localStorage.getItem("user_id");
    setUpdating(true);
    try {
      const res = await fetch(`/api/issues/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          text: commentText,
          isOfficial: demoRole === "authority"
        })
      });
      
      if (res.ok) {
        setCommentText("");
        toast.success("Comment published!");
        const refresh = await fetch(`/api/issues/${params.id}`);
        const updatedIssue = await refresh.json();
        if (updatedIssue && updatedIssue.id) {
          setIssue(updatedIssue);
        }
      }
    } catch (err) {
      console.error("Comment sync error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    const role = localStorage.getItem("user_role");
    if (role !== "authority") {
      toast.error("Unauthorized access to task management");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to manage tasks");
      router.push(`/auth/login?redirect=/reports/${params.id}`);
      return;
    }

    setUpdating(true);
    try {
      let endpoint = '';
      let body = {};

      if (newStatus === "In Progress") {
        const officialId = localStorage.getItem("user_id") || "auth_prem_singh";
        const tasksRes = await fetch(`/api/tasks/official?officialId=${officialId}`);
        const tasks = await tasksRes.json();
        const task = tasks.find((t: any) => t.issueId === issue.id);
        if (task) {
          endpoint = `/api/tasks/${task.id}/start`;
        }
      } else if (newStatus === "Resolved") {
        const officialId = localStorage.getItem("user_id") || "auth_prem_singh";
        const tasksRes = await fetch(`/api/tasks/official?officialId=${officialId}`);
        const tasks = await tasksRes.json();
        const task = tasks.find((t: any) => t.issueId === issue.id);
        if (task) {
          endpoint = `/api/tasks/${task.id}/submit`;
          body = {
            afterPhotoUrl: resolutionPhoto || "/resolved_placeholder.png",
            notes: resolutionNotes || "Issue resolved and verified on-site.",
            latitude: issue.latitude,
            longitude: issue.longitude
          };
        }
      }
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (newStatus === "In Progress") {
          toast.success("Work started!");
        }
        
        if (newStatus === "Resolved") {
          const officialId = localStorage.getItem("user_id") || "auth_prem_singh";
          const tasksRes = await fetch(`/api/tasks/official?officialId=${officialId}`);
          const tasks = await tasksRes.json();
          const task = tasks.find((t: any) => t.issueId === issue.id);
          if (task) {
            router.push(`/report?resolve=true&taskId=${task.id}&issueId=${issue.id}`);
            return;
          }
        }

        const refreshRes = await fetch(`/api/issues/${params.id}`);
        const data = await refreshRes.json();
        setIssue(data);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!issue || !issue.status) return <div className="text-center py-20 min-h-screen flex items-center justify-center flex-col gap-4">
    <div className="bg-white p-6 rounded-2xl border border-slate-100 premium-shadow">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Not Found</h2>
      <p className="text-slate-500 mb-6">The civic issue you are looking for might have been moved or resolved.</p>
      <Link href="/reports" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Back to Feed</Link>
    </div>
  </div>;

  const displayStatus = (issue.status || "Filed").charAt(0).toUpperCase() + (issue.status || "Filed").slice(1).replace('_', ' ');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 pt-28">
      <Toaster position="top-right" />
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </button>

        <div className="flex items-center bg-white border border-slate-100 rounded-full p-1 shadow-sm">
          {mounted && userRole === "citizen" && (
            <span className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 flex items-center gap-2 rounded-full border border-primary/10">
              Citizen View
            </span>
          )}
          {mounted && !userRole && (
            <span className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 flex items-center gap-2 rounded-full border border-slate-100">
              Guest Mode
            </span>
          )}
          {mounted && userRole === "authority" && (
            <span className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/5 flex items-center gap-2 rounded-full border border-secondary/10">
              <ShieldCheck className="w-3 h-3" />
              Official Access
            </span>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image Header */}
          <div className="bg-white rounded-2xl premium-shadow border border-slate-100 overflow-hidden">
            <div className="w-full h-72 md:h-96 bg-slate-100 flex items-center justify-center relative">
              <span
                className={`absolute top-4 left-4 px-3 py-1 text-sm font-bold rounded-full border shadow-sm flex items-center ${getStatusColor(issue.status)}`}
              >
                {getStatusIcon(issue.status)}
                <span className="ml-2 uppercase tracking-wide">
                  {displayStatus}
                </span>
              </span>
              {issue.photoUrl ? (
                <img 
                  src={issue.photoUrl} 
                  alt="Report Photo" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.png";
                  }}
                />
              ) : (
                <div className="text-slate-300 text-center">
                  Image Placeholder
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4 text-sm">
                <span className="bg-primary/5 text-primary border border-primary/10 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-xs">
                  {issue.category}
                </span>
                <span className="text-slate-500 font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight font-headline">
                {issue.title}
              </h1>

              <div className="flex items-center text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                <MapPin className="w-5 h-5 mr-3 text-primary shrink-0" />
                <span className="font-medium text-sm md:text-base">
                  {issue.locationAddress || "Specified Location"}
                </span>
              </div>

              <div className="prose prose-sm md:prose-base max-w-none text-slate-700 mb-8">
                <p className="leading-relaxed whitespace-pre-line font-medium text-lg">
                  {issue.description}
                </p>
              </div>

              {/* Resolution Evidence */}
              {(issue.status === "resolved" || issue.status === "Approved" || issue.status === "Verified") && (
                <div className="mb-8 bg-secondary/5 border-2 border-secondary/20 rounded-2xl overflow-hidden">
                  <div className="bg-secondary/10 px-6 py-3 border-b border-secondary/20 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4" />
                       Official Resolution Evidence
                    </h3>
                    <span className="text-[10px] font-bold text-secondary/70 bg-secondary/10 px-2 py-1 rounded">VERIFIED</span>
                  </div>
                  <div className="p-0 flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 h-64 bg-slate-100">
                      <img 
                        src={issue.resolutionPhoto || "/resolved_placeholder.png"} 
                        alt="Resolution Evidence" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-1/2 flex flex-col justify-center">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">Resolution Note</p>
                      <p className="text-slate-700 font-medium italic leading-relaxed">
                        "{issue.resolutionNotes || "Issue addressed and verified on-site by designated authority."}"
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-secondary">
                         <MapPin className="w-3 h-3" />
                         <span className="text-xs font-bold uppercase tracking-widest">Geo-Tagged Completion</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voting - Citizen Only */}
              {demoRole === "citizen" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 p-0.5">
                    <button
                      onClick={() => handleVote(1)}
                      className="px-5 py-2 text-slate-500 hover:text-secondary hover:bg-secondary/10 rounded-l-full transition-all flex items-center gap-2"
                      title="Upvote"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-bold text-slate-900 text-base">
                        {Array.isArray(issue.votes) ? issue.votes.reduce((acc: number, v: any) => acc + v.value, 0) : issue.votes || 0}
                      </span>
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200"></div>
                    <button
                      onClick={() => handleVote(-1)}
                      className="px-5 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-r-full transition-all"
                      title="Downvote"
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center text-sm font-medium text-slate-500">
                    Reported by:
                    <span className="text-slate-900 ml-2 font-bold bg-slate-100 px-2 py-1 rounded">
                      {issue.anonymousUsername || issue.reporter?.anonymousName || "Anonymous"}
                    </span>
                  </div>
                </div>
              )}

              {demoRole === "authority" && (
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-widest">
                        Community Priority: {Array.isArray(issue.votes) ? issue.votes.reduce((acc: number, v: any) => acc + v.value, 0) : issue.votes || 0} Points
                      </span>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl premium-shadow border border-slate-100 p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center font-headline">
                <MessageSquare className="w-5 h-5 mr-3 text-primary" />
                Community Discussion ({issue.comments?.length || 0})
              </h3>

              {/* Comment Input */}
              <div className="flex gap-5 mb-8 items-center">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-blue-700 text-white flex items-center justify-center font-bold shrink-0">
                  {userInitial.toUpperCase()}
                </div>
                <div className="flex-1 relative group">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onFocus={() => {
                      if (!isAuthenticated) {
                        toast.error("Authentication required");
                      }
                    }}
                    placeholder={isAuthenticated ? "Add a comment..." : "Please login first..."}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm resize-none pr-14 py-4 px-6 transition-all outline-none min-h-[60px] leading-relaxed"
                    rows={2}
                  />
                  <div className="absolute right-3 bottom-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleComment();
                      }}
                      className="p-2.5 text-white bg-primary rounded-xl hover:bg-slate-800 transition-all disabled:opacity-20 shadow-sm active:scale-95 flex items-center justify-center"
                      disabled={!commentText.trim() || updating}
                    >
                      {updating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment List */}
              <div className="space-y-6">
                {issue.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0 text-sm">
                      {comment.firstName?.substring(0, 2) || "C"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">
                          {comment.user || "Citizen"}
                        </span>
                        {comment.isOfficial && (
                          <span className="text-[8px] font-bold text-white bg-secondary px-2 py-0.5 rounded-sm uppercase mr-2">
                             Official
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-lg rounded-tl-none border border-slate-100">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Authority Actions */}
          {demoRole === "authority" && (
            <div className="bg-gradient-to-br from-secondary/5 to-white rounded-2xl premium-shadow border border-secondary/20 p-6 relative overflow-hidden">
              <h3 className="text-lg font-bold mb-4 relative z-10 text-slate-900 flex items-center gap-2 border-b border-secondary/10 pb-3 font-headline">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                Resolution Actions
              </h3>

              <div className="space-y-4 relative z-10 pt-2">
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-slate-500 block mb-2">
                    Task Verification
                  </label>
                  <p className="text-sm text-slate-500 mb-4">You are assigned to this issue. Update its state as you work on it.</p>
                </div>

                {issue.status === "assigned" || issue.status === "filed" ? (
                  <button 
                    disabled={updating}
                    onClick={() => handleStatusUpdate("In Progress")}
                    className="w-full bg-primary text-white font-bold py-4 px-4 rounded-xl shadow-md hover:bg-slate-800 transition-all text-sm disabled:opacity-50"
                  >
                    {updating ? "Starting..." : "Acknowledge & Start Work"}
                  </button>
                ) : issue.status === "in_progress" || (issue.status || "").toLowerCase().includes("progress") ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 mb-4">Provide resolution evidence to finalize.</p>
                    <button 
                      disabled={updating}
                      onClick={() => handleStatusUpdate("Resolved")}
                      className="w-full bg-secondary text-white font-bold py-4 px-4 rounded-xl shadow-md hover:brightness-105 transition-all text-sm"
                    >
                      {updating ? "Processing..." : "Submit Resolution Proof"}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-secondary/10 rounded-xl text-center border border-secondary/20">
                    <p className="text-secondary font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Issue Resolved
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment Card */}
          <div className="bg-white rounded-2xl premium-shadow p-6 relative overflow-hidden border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 relative z-10 flex items-center gap-2 font-headline">
              Assignment
            </h3>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Assigned To</p>
                <p className="text-lg font-semibold text-slate-900">
                  {issue.authority?.name || "Assigning Official..."}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Resolution Deadline</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <p className="font-medium text-slate-900">{issue.deadline ? new Date(issue.deadline).toLocaleDateString() : "Calculating..."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Card */}
          <div className="bg-white rounded-2xl premium-shadow border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-900 font-headline">Location Map</h3>
            </div>
            <div className="h-48 bg-slate-100 relative">
              <img
                src={getStaticMapUrl(issue.latitude, issue.longitude, 600, 400)}
                alt="Map Location"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="text-red-500 w-10 h-10 drop-shadow-md" />
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-2xl premium-shadow border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 font-headline">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Status Tracking
            </h3>

            <div className="space-y-6">
              <div className="relative pl-6 pb-2">
                <div className="absolute left-[9px] top-6 bottom-[-24px] w-px bg-slate-200" />
                <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center border-primary text-primary bg-primary/10">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Filed</span>
                    <span className="text-xs text-slate-400 font-medium font-mono">{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Issue reported by citizen.</p>
                </div>
              </div>
              
              {issue.status !== "filed" && (
                <div className="relative pl-6 pb-2">
                  <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center border-secondary text-secondary bg-secondary/10">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">{issue.status}</span>
                      <span className="text-xs text-slate-400 font-medium font-mono">Current Status</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">The issue is currently being handled.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
