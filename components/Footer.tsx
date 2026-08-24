import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="w-full pt-20 md:pt-24 pb-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-24">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xs">domain</span>
              </span>
              <span className="text-2xl font-extrabold text-primary tracking-tight">
                Jan Seva
              </span>
            </Link>
            <p className="font-body text-sm text-slate-500 leading-relaxed font-light">
              A minimalist civic-tech ecosystem dedicated to fostering transparency and excellence in urban governance.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-primary text-xs uppercase tracking-widest mb-6 md:mb-8">Navigation</h4>
            <div className="flex flex-col gap-3 md:gap-4">
              <Link className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="/">Home</Link>
              <Link className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="/report">Report Issue</Link>
              <Link className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="/reports">Community Reports</Link>
              <Link className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="/map">Live Map</Link>
              <Link className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="/leaderboard">Leaderboard</Link>
            </div>
          </div>

          {/* Transparency */}
          <div>
            <h4 className="font-bold text-primary text-xs uppercase tracking-widest mb-6 md:mb-8">Transparency</h4>
            <div className="flex flex-col gap-3 md:gap-4">
              <Link className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="/authorities">Authorities</Link>
              <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="#">Data Privacy</a>
              <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="#">Governance</a>
              <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light" href="#">Terms of Use</a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="font-bold text-primary text-xs uppercase tracking-widest mb-6 md:mb-8">Newsletter</h4>
            <p className="text-sm text-slate-500 mb-6 font-light">Stay updated with city-wide reports.</p>
            <div className="flex flex-col gap-2 md:gap-3">
              <input
                className="bg-slate-50 border border-slate-100 rounded-full px-5 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-none w-full text-slate-900 placeholder-slate-400"
                placeholder="Email address"
                type="email"
              />
              <button className="bg-primary text-white py-3 rounded-full text-sm font-bold hover:bg-slate-800 transition-all w-full">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 pt-8 md:pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-body text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Jan Seva Platform. All rights reserved.
          </p>
          <div className="flex gap-6 md:gap-8">
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-lg md:text-xl">share</span>
            </a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-lg md:text-xl">alternate_email</span>
            </a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-lg md:text-xl">language</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
