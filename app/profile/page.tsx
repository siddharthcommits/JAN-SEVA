"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Award,
  CheckCircle2,
  TrendingUp,
  Settings,
  Edit3,
  User,
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<"citizen" | "authority">("citizen");
  const [dynamicStats, setDynamicStats] = useState<any>(null);

  const [citizenProfile, setCitizenProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567"
  });

  const [officialProfile, setOfficialProfile] = useState({
    name: "Prem Singh",
    department: "Public Works Department (PWD)",
    employeeId: "EMP-2022-8821",
    email: "p.singh@gov.in"
  });

  useEffect(() => {
    const savedRole = localStorage.getItem("user_role") as "citizen" | "authority" || "citizen";
    if (savedRole) setRole(savedRole);

    const savedCit = localStorage.getItem("citizen_profile_data");
    if (savedCit) setCitizenProfile(JSON.parse(savedCit));

    const savedOff = localStorage.getItem("official_profile_data");
    if (savedOff) setOfficialProfile(JSON.parse(savedOff));

    const uId = localStorage.getItem("user_id") || (savedRole === "authority" ? "auth_prem_singh" : "citizen_4729");
    
    const fetchStats = async () => {
      try {
        const endpoint = savedRole === "authority" ? `/api/authority/${uId}/stats` : `/api/citizen/${uId}/stats`;
        const res = await fetch(endpoint);
        if (res.ok) setDynamicStats(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchStats();
  }, []);

  const handleSave = () => {
    if (role === "authority") {
      localStorage.setItem("official_profile_data", JSON.stringify(officialProfile));
    } else {
      localStorage.setItem("citizen_profile_data", JSON.stringify(citizenProfile));
    }
    setIsEditing(false);
  };

  const isOfficial = role === "authority";

  const citizenData = {
    displayName: citizenProfile.name.split(" ")[0] || "Citizen",
    rank: "Civic Contributor",
    score: dynamicStats?.score || 450,
    scoreLabel: "Impact Reputation",
    joinDate: "September 12, 2023",
    stats: [
      { label: "Reported", value: dynamicStats?.totalReports || 0 },
      { label: "Resolved", value: dynamicStats?.resolvedReports || 0 },
      { label: "In Progress", value: dynamicStats?.inProgress || 0 },
      { label: "Votes Cast", value: dynamicStats?.votesCast || 0 },
    ],
    privateDetails: [
      { id: "name", label: "Full Name", value: citizenProfile.name },
      { id: "email", label: "Email", value: citizenProfile.email },
      { id: "phone", label: "Phone", value: citizenProfile.phone },
    ],
    insight: {
      title: "Efficiency Insight",
      text: "You are in the Top 15% of contributors this month. Your precise reporting has enabled local authorities to repair 5 critical infrastructure points."
    }
  };

  const officialData = {
    displayName: officialProfile.name || "Prem Singh",
    rank: "Junior Engineer (PWD)",
    score: dynamicStats?.totalPoints || 145,
    scoreLabel: "Service Rating",
    joinDate: "January 04, 2022",
    stats: [
      { label: "Tasks Cleared", value: dynamicStats?.completedTasks || 0 },
      { label: "Avg Speed", value: dynamicStats?.avgResolutionTime || "1.8d" },
      { label: "Rating", value: `${dynamicStats?.averageRating || 4.7}★` },
      { label: "Pending", value: dynamicStats?.pendingCritical || 0 },
    ],
    privateDetails: [
      { id: "department", label: "Department", value: officialProfile.department },
      { id: "employeeId", label: "Employee ID", value: officialProfile.employeeId },
      { id: "email", label: "Gov Email", value: officialProfile.email },
    ],
    insight: {
      title: "Service Excellence",
      text: "Your average resolution time is 20% faster than the department average. Keep up the high responsiveness to maintain your silver badge status."
    }
  };

  const currentData = isOfficial ? officialData : citizenData;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-28">
      {/* Profile Header */}
      <div className={`bg-white rounded-3xl border ${isOfficial ? 'border-secondary/20' : 'border-slate-100'} premium-shadow overflow-hidden mb-10 relative`}>
        <div className={`absolute top-0 left-0 w-full h-[200px] bg-gradient-to-br ${isOfficial ? 'from-secondary/5' : 'from-primary/5'} via-transparent to-transparent pointer-events-none`}></div>
        <div className="p-6 sm:p-10 relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
          <div className="relative group lg:-mb-4">
            <div className={`w-36 h-36 bg-gradient-to-tr ${isOfficial ? 'from-secondary to-emerald-700' : 'from-primary to-blue-800'} text-white rounded-3xl flex items-center justify-center shadow-xl border border-white/20 transition-all duration-500 group-hover:scale-105`}>
              <User size={64} strokeWidth={2} className="opacity-90" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col justify-center">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-headline">
                {currentData.displayName}
              </h1>
              <span className={`inline-flex items-center text-xs font-bold ${isOfficial ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'} border px-3 py-1 rounded-full h-fit`}>
                <Shield className="w-3 h-3 mr-2" />
                {isOfficial ? "Official Access" : "Identity Protected"}
              </span>
            </div>
            <p className="text-slate-400 font-medium text-sm">
              {currentData.rank} since <span className="text-slate-700">{currentData.joinDate}</span>
            </p>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 text-center w-full md:min-w-[200px]">
            <div className={`flex items-center justify-center gap-3 ${isOfficial ? 'text-secondary' : 'text-amber-500'} mb-2`}>
              <Award className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tighter">
                {currentData.score}
              </span>
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
              {currentData.scoreLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6 sm:space-y-10">
          <section className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 premium-shadow">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 sm:mb-10 flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${isOfficial ? 'bg-secondary' : 'bg-amber-500'} animate-pulse`} />
              {isOfficial ? "Performance Tracking" : "Your Live Civic Impact"}
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {currentData.stats.map((stat, i) => (
                <div key={i} className="bg-slate-50 p-4 sm:p-8 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all">
                  <p className="text-4xl sm:text-6xl font-extrabold mb-1 sm:mb-3 tracking-tighter text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={`bg-gradient-to-r ${isOfficial ? 'from-secondary/5' : 'from-primary/5'} to-transparent rounded-2xl border ${isOfficial ? 'border-secondary/10' : 'border-primary/10'} p-8 flex items-start gap-6 relative overflow-hidden group`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${isOfficial ? 'bg-secondary' : 'bg-primary'}`}></div>
            <div className={`${isOfficial ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'} p-4 rounded-2xl shrink-0 border`}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-xl font-headline mb-2">
                {currentData.insight.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-light">
                {currentData.insight.text}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden premium-shadow">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {isOfficial ? "Departmental Records" : "Private Identity"}
              </h2>
              <button
                className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all p-3 rounded-xl border border-slate-100"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className={`${isOfficial ? 'bg-secondary/5 border-secondary/10 text-secondary/80' : 'bg-primary/5 border-primary/10 text-primary/80'} p-4 rounded-xl flex items-center gap-4 border`}>
                <Shield className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-widest leading-tight">
                  {isOfficial ? "Institutional Data: Verified by the Department." : "Encrypted: These details are masked from public views."}
                </p>
              </div>

              {currentData.privateDetails.map((field, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                    {field.label}
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => {
                        if (isOfficial) {
                          setOfficialProfile({ ...officialProfile, [field.id]: e.target.value });
                        } else {
                          setCitizenProfile({ ...citizenProfile, [field.id]: e.target.value });
                        }
                      }}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 ${isOfficial ? 'focus:ring-secondary' : 'focus:ring-primary'} transition-all text-sm font-medium`}
                    />
                  ) : (
                    <p className="text-slate-900 font-bold text-lg">
                      {field.value}
                    </p>
                  )}
                </div>
              ))}

              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </span>
                <span className="flex items-center text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                  {isOfficial ? "ACTIVE DUTY" : "VERIFIED"}
                </span>
              </div>

              {isEditing && (
                <div className="pt-6">
                  <button
                    onClick={handleSave}
                    className={`w-full py-4 ${isOfficial ? 'bg-secondary hover:bg-emerald-700' : 'bg-primary hover:bg-slate-800'} text-white rounded-xl font-bold text-sm transition-all`}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
