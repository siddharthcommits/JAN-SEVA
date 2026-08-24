"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, MapPin, Star, Search, Trophy } from "lucide-react";

export default function AuthoritiesPage() {
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAuthorities = async () => {
      try {
        const res = await fetch("/api/authority/list");
        if (res.ok) {
           const data = await res.json();
           setAuthorities(data.map((a: any) => ({
             id: a.id,
             name: a.name,
             jurisdiction: a.jurisdictionWards || a.jurisdictionSectors || "Unknown Sector",
             points: a.totalPoints || 0,
             rating: a.averageRating || 0,
             role: a.designation || a.department || "Official"
           })));
        } else {
           setAuthorities([
             { id: "auth_prem_singh", name: "Prem Singh", jurisdiction: "Sector 14 & 15", points: 450, rating: 4.8, role: "Roads Inspector" },
             { id: "auth_meera_sharma", name: "Meera Sharma", jurisdiction: "Sector 22", points: 380, rating: 4.9, role: "Sanitation Lead" }
           ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthorities();
  }, []);

  const filtered = authorities.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.jurisdiction.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 pt-28">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-primary font-headline tracking-tight mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-secondary" />
            Official Directory
          </h1>
          <p className="text-slate-500 font-light">
            Browse verified authorities and track their performance in your sector.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or sector..."
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((auth) => (
            <div key={auth.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group premium-shadow">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-2xl font-extrabold text-primary">
                    {auth.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{auth.name}</h3>
                    <p className="text-sm font-medium text-slate-500">{auth.role || "Official"}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-700">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{auth.jurisdiction}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-bold">{auth.rating} / 5.0 Rating</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Trophy className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-bold">{auth.points} Performance Points</span>
                  </div>
                </div>

                <Link 
                  href={`/dashboard?officialId=${auth.id}`}
                  className="block w-full text-center py-3 bg-primary hover:bg-slate-800 text-white rounded-xl font-bold transition-all text-sm"
                >
                  View Performance
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
