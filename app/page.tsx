"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(
      !!session || localStorage.getItem("demo_logged_in") === "true",
    );
  }, [session]);

  const handleReportClick = () => {
    const isDemo = localStorage.getItem("demo_logged_in") === "true";
    const userId = session?.user?.email || (isDemo ? localStorage.getItem("user_id") : null);

    if (!userId) {
      toast.error("Please login to report an issue");
      router.push("/auth/login?redirect=/report");
    } else {
      router.push("/report");
    }
  };

  return (
    <div className="min-h-screen font-body">
      <Toaster position="top-right" />

      {/* ─── Hero Section ─── */}
      <header className="pt-28 pb-20 md:pt-32 md:pb-32 hero-gradient relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Soft abstract background blurs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          <div className="lg:col-span-6 text-center lg:text-left">
            <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 md:mb-8">
              Empowering <span className="text-secondary">Citizens.</span><br />
              Improving <span className="font-light opacity-90 italic">Cities.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
              Jan Seva connects citizens with municipal authorities to report, track, and resolve local problems through a clean digital infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleReportClick}
                className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-[1rem] hover:scale-105 transition-all premium-shadow flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">campaign</span>
                Get Started
              </button>
              <Link href="/map">
                <button className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full font-bold text-[1rem] hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined">explore</span>
                  Live Map
                </button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 mt-12 lg:mt-0 px-4 sm:px-0">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-secondary/10 to-indigo-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-primary-container/30 backdrop-blur-sm rounded-[2rem] p-3 border border-white/5 premium-shadow">
                <img
                  className="rounded-[1.5rem] w-full aspect-[4/3] object-cover opacity-90"
                  alt="Modern 3D city map interface on a device"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm6Yr6vkgFzSLycFK24FJrqD-9mHc3YLifhKumFMl8CSxa9K23lAtZUU8EOTimVMFpdgFuLh0e2x5_jlKQlZ3zfn4G5qIDhvAcD_G8nmI5RiQefdH3MoOPYtwk3p6S2WmZFaccJpHhr3KXyJixP5svv7BAV6BtrTZCHMHPZ2H2DMI_JsVd-WoTC2VNZilCtMPyrgXngDLs_n4aNsUuSnkZsEhMrO91d9BGdbfofYcwtwyoPSXoBXuoBogrQURQ0YOZ9vSmJadpSKz3"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Process Section ─── */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-20">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block opacity-80">Our Process</span>
            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary">How Jan Seva Works</h2>
            <div className="w-12 h-1 bg-secondary mx-auto mt-6 rounded-full opacity-80"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <div className="flex flex-col items-center text-center group premium-hover">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-2xl md:text-3xl">stylus</span>
              </div>
              <h3 className="font-headline text-xl md:text-2xl font-bold text-primary mb-4">1. Report</h3>
              <p className="text-slate-500 font-light leading-relaxed max-w-xs">Instantly document infrastructure issues with precise geo-location and high-res media.</p>
            </div>

            <div className="flex flex-col items-center text-center group premium-hover">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-2xl md:text-3xl">group</span>
              </div>
              <h3 className="font-headline text-xl md:text-2xl font-bold text-primary mb-4">2. Validate</h3>
              <p className="text-slate-500 font-light leading-relaxed max-w-xs">Community validation ensures urgent problems are prioritized through a transparent voting system.</p>
            </div>

            <div className="flex flex-col items-center text-center group premium-hover">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-2xl md:text-3xl">verified</span>
              </div>
              <h3 className="font-headline text-xl md:text-2xl font-bold text-primary mb-4">3. Resolve</h3>
              <p className="text-slate-500 font-light leading-relaxed max-w-xs">Authorities utilize smart dashboards to dispatch teams and track resolution in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-24 md:py-32 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-3xl mb-16 md:mb-24">
            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary mb-6">Modern Civic Management</h2>
            <p className="text-slate-500 text-lg md:text-xl font-light leading-relaxed">Sophisticated yet minimal features designed to bridge the gap between citizen needs and administrative actions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-4 glass-card p-8 md:p-10 rounded-2xl md:rounded-3xl premium-hover group">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-xl md:text-2xl">location_on</span>
              </div>
              <h4 className="font-headline font-bold text-lg md:text-xl mb-3">Geo-tagging</h4>
              <p className="text-slate-500 font-light text-sm leading-relaxed">Precision GPS integration for accurate field navigation and resource allocation.</p>
            </div>

            <div className="md:col-span-4 glass-card p-8 md:p-10 rounded-2xl md:rounded-3xl premium-hover group">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-xl md:text-2xl">photo_camera</span>
              </div>
              <h4 className="font-headline font-bold text-lg md:text-xl mb-3">Media Evidence</h4>
              <p className="text-slate-500 font-light text-sm leading-relaxed">Secure upload of visual evidence to provide authorities with context and scale.</p>
            </div>

            <div className="md:col-span-4 glass-card p-8 md:p-10 rounded-2xl md:rounded-3xl premium-hover group">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-xl md:text-2xl">how_to_reg</span>
              </div>
              <h4 className="font-headline font-bold text-lg md:text-xl mb-3">Social Voting</h4>
              <p className="text-slate-500 font-light text-sm leading-relaxed">Democratic prioritization allows the community to signal urgency on critical issues.</p>
            </div>

            <div className="md:col-span-12 lg:col-span-7 glass-card p-8 md:p-12 rounded-2xl md:rounded-3xl premium-hover group flex flex-col md:flex-row gap-8 md:gap-10 items-center">
              <div className="flex-1">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl md:text-2xl">analytics</span>
                </div>
                <h4 className="font-headline font-bold text-xl md:text-2xl mb-4">Smart Analytics</h4>
                <p className="text-slate-500 font-light leading-relaxed mb-0">Heatmaps and density analytics reveal chronic problem zones, enabling proactive maintenance strategies with minimal noise.</p>
              </div>
              <div className="w-full md:w-2/5 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <img
                  className="w-full h-48 md:h-56 object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  alt="Analytics dashboard"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1Cxkosism6NmKlRydQvPYIGwAqVQ5Y9U33mQ9KGPEzZw07uCo3ZsLEgEMQnBzomsG3Oeyqv0R9PCvzwMok6_dxD7a2ECIS1PesE99jjDkFh6MWwJYNDV1b3KTZwjilV_CRvqqTEpCLKvV7ZAQ3j-cxpUjf8ss8eGgmFFJDp-SUc1JZHYV5q8eTogEwDFaKoAJFUK60K04glzGPi1ubylpSbLYM5tJ3PRcRzMul8WjG5zpIdxeVcY3LKo2B2fpT9xuGrGsMkf6qCXC"
                />
              </div>
            </div>

            <div className="md:col-span-12 lg:col-span-5 glass-card p-8 md:p-12 rounded-2xl md:rounded-3xl premium-hover group">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-xl md:text-2xl">update</span>
              </div>
              <h4 className="font-headline font-bold text-xl md:text-2xl mb-4">Real-time Status</h4>
              <p className="text-slate-500 font-light leading-relaxed">Transparent tracking from submission to resolution ensures accountability and citizen trust globally.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="py-20 md:py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-2 md:mb-3 text-secondary tracking-tighter">24k+</div>
              <div className="text-slate-400 font-medium text-xs md:text-sm tracking-widest uppercase">Reported</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-2 md:mb-3 text-secondary tracking-tighter">18k</div>
              <div className="text-slate-400 font-medium text-xs md:text-sm tracking-widest uppercase">Resolved</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-2 md:mb-3 text-secondary tracking-tighter">120</div>
              <div className="text-slate-400 font-medium text-xs md:text-sm tracking-widest uppercase">Communities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-2 md:mb-3 text-secondary tracking-tighter">48h</div>
              <div className="text-slate-400 font-medium text-xs md:text-sm tracking-widest uppercase">Avg Resol.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Map Preview Section ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary mb-4 md:mb-6">Real-Time Civic Map</h2>
              <p className="text-slate-500 text-base md:text-lg font-light">Experience the pulse of your neighborhood. Active monitoring provides total transparency.</p>
            </div>
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-full shrink-0">
              <Link href="/map" className="px-5 md:px-6 py-2 rounded-full bg-white text-primary font-bold shadow-sm text-xs md:text-sm">Map View</Link>
              <Link href="/reports" className="px-5 md:px-6 py-2 rounded-full text-slate-500 font-medium text-xs md:text-sm hover:text-primary transition-colors">List View</Link>
            </div>
          </div>

          <div className="relative bg-slate-900 rounded-[2rem] md:rounded-[3rem] h-[500px] md:h-[650px] overflow-hidden premium-shadow border border-slate-200">
            <div className="absolute inset-0 opacity-40 grayscale contrast-125">
              <img
                className="w-full h-full object-cover"
                alt="High-tech city map"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO55CQ93QwcRB97s3OFJ_YAizlVqM_MsdywODc_8jTHP8p3g9j5hbtgxg94GEhRlvB1yc6119QVKeay1pPPQSF_D6o1ujJDzmQUDMMgIkNTZ5IGfP9FdTY_dNJb9XVeJtZtnE1IQFg_MN8ViWasqbnfDMBdv9BzROy-lWA8mk28LBEwEC2Ndbw4ScXqCQtYVnP4bV0OocRWbc8GplgYUMkBPyn2xhYrjEntc8zFU4NqDG2B__cI5GkVcFb-qpOplofLz03Cj-jLvl3"
              />
            </div>
            <div className="absolute inset-0 dark-map-overlay pointer-events-none"></div>

            {/* Mock Map UI Markers */}
            <div className="absolute inset-0 p-6 md:p-12 pointer-events-none">
              <div className="absolute top-[35%] left-[30%] md:left-[42%] flex flex-col items-center pointer-events-auto">
                <div className="bg-slate-900/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-red-500/30 flex items-center gap-2 md:gap-3 animate-pulse">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 marker-glow"></span>
                  <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Water Leak</span>
                </div>
                <div className="w-px h-6 md:h-8 bg-gradient-to-b from-red-500 to-transparent"></div>
              </div>

              <div className="absolute top-[60%] left-[50%] md:left-[58%] flex flex-col items-center pointer-events-auto">
                <div className="bg-slate-900/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-secondary/30 flex items-center gap-2 md:gap-3">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-secondary marker-glow"></span>
                  <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Cleanup</span>
                </div>
                <div className="w-px h-6 md:h-8 bg-gradient-to-b from-secondary to-transparent"></div>
              </div>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 bg-slate-900/90 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 premium-shadow">
              <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Legend</div>
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 marker-glow"></span>
                  <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Action Needed</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span className="text-xs text-slate-300 font-medium whitespace-nowrap">In Progress</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 md:py-32 relative bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
          <span className="material-symbols-outlined text-[30rem] md:text-[60rem]">public</span>
        </div>
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10">
          <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-6 md:mb-10 leading-tight">
            Better Cities, <br className="md:hidden" /><span className="italic font-light">Built Together.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 mb-10 md:mb-16 font-light max-w-2xl mx-auto">
            Join the movement for transparent, efficient, and modern civic management in your neighborhood.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            <button
              onClick={handleReportClick}
              className="bg-primary text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg hover:bg-slate-800 transition-all premium-shadow flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-xl">rocket_launch</span>
              Get Started Now
            </button>
            <Link href="/reports">
              <button className="bg-white border border-slate-200 text-primary px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                View Demo
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
