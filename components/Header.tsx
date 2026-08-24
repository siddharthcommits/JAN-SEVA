"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  AlertTriangle,
  FileText,
  Users,
  Trophy,
  User,
  Search,
  Menu,
  Landmark,
  Compass,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    localStorage.removeItem("demo_logged_in");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    await signOut({ callbackUrl: "/auth/login" });
  };

  useEffect(() => {
    setIsAuthenticated(
      !!session || localStorage.getItem("demo_logged_in") === "true",
    );
  }, [session, pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileSearchOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: Landmark },
    { name: "Report Issue", href: "/report", icon: AlertTriangle },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Map", href: "/map", icon: Compass },
    { name: "Authorities", href: "/authorities", icon: Users },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-nav h-20">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-8 h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">domain</span>
          </span>
          <span className="text-2xl font-extrabold text-primary tracking-tight font-headline hidden sm:block">
            Jan Seva
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href + "/"));

            if (link.name === "Report Issue") {
              return (
                <button
                  key={link.name}
                  onClick={() => {
                    const isDemo = localStorage.getItem("demo_logged_in") === "true";
                    const userId = session?.user?.email || (isDemo ? localStorage.getItem("user_id") : null);
                    if (!userId) {
                      toast.error("Please login to report an issue");
                      router.push("/auth/login?redirect=/report");
                    } else {
                      router.push("/report");
                    }
                  }}
                  className={`font-headline font-medium text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-primary relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                      : "text-slate-500 hover:text-primary"
                  }`}
                >
                  {link.name}
                </button>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-headline font-medium text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-primary relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-slate-500 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden lg:flex relative">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 xl:w-56 py-2 pl-9 pr-3 rounded-full bg-slate-100 border border-slate-100 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all placeholder-slate-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </form>

          {/* Auth buttons / Profile */}
          {isAuthenticated ? (
            <div className="hidden lg:flex relative group">
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
              >
                <User className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                <Link
                  href="/profile"
                  className="block text-left w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden lg:flex bg-secondary text-white px-7 py-2.5 rounded-full font-bold text-sm hover:brightness-105 transition-all premium-shadow items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              Sign In
            </Link>
          )}

          {/* Mobile controls */}
          <button
            className="lg:hidden p-2 text-primary"
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              setMobileMenuOpen(false);
            }}
            aria-label="Toggle Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            className="lg:hidden p-2 text-primary"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setMobileSearchOpen(false);
            }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileSearchOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-lg px-4 py-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
            />
          </form>
        </div>
      )}

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-xl pb-4">
          <div className="px-4 py-3">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href + "/"));
                const Icon = link.icon;

                if (link.name === "Report Issue") {
                  return (
                    <button
                      key={link.name}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        const isDemo = localStorage.getItem("demo_logged_in") === "true";
                        const userId = session?.user?.email || (isDemo ? localStorage.getItem("user_id") : null);
                        if (!userId) {
                          toast.error("Please login to report an issue");
                          router.push("/auth/login?redirect=/report");
                        } else {
                          router.push("/report");
                        }
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                        isActive
                          ? "bg-primary/5 text-primary font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                      isActive
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-2 w-full py-3 text-center rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 w-full block py-3 text-center rounded-xl bg-secondary text-white font-bold text-sm hover:brightness-105 transition-all premium-shadow"
                >
                  Sign In / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
