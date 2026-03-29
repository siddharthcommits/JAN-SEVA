import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

export const CitizenNavBar = () => {
 const user = useAuthStore((state) => state.user);

 return (
 <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_24px_48px_-12px_rgba(0,30,64,0.08)]">
 <div className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto font-['Manrope'] tracking-tight">
 {/* Brand */}
 <div className="flex items-center gap-8">
 <span className="text-2xl font-black text-[#001e40]">Jan Seva</span>
 {/* Navigation Links (Desktop) */}
 <div className="hidden lg:flex items-center gap-6">
 <a className="text-[#001e40] font-bold border-b-2 border-[#001e40] pb-1"href="#feed">Feed</a>
 <Link to="/leaderboard" className="text-slate-500 hover:text-[#001e40] transition-colors">Leaderboard</Link>
 <a className="text-slate-500 hover:text-[#001e40] transition-colors"href="#communities">Communities</a>
 <a className="text-slate-500 hover:text-[#001e40] transition-colors"href="#impact">Impact</a>
 </div>
 </div>

 {/* Search Bar */}
 <div className="hidden md:flex flex-1 max-w-xl mx-12">
 <div className="relative w-full group">
 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
 <input 
 className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
 placeholder="Search issues..."
 type="text"
 />
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-4">
 <button className="p-2 text-primary hover:bg-slate-50 rounded-full transition-all">
 <span className="material-symbols-outlined">notifications</span>
 </button>
 <div className="flex items-center gap-2 p-1 pl-3 rounded-full border border-outline-variant/20 hover:bg-slate-50 cursor-pointer" onClick={() => useAuthStore.getState().logout()}>
 <span className="text-sm font-semibold text-primary hidden sm:inline-block">
 {user ? (user.name || user.email.split('@')[0]) : 'Citizen'}
 </span>
 <span className="material-symbols-outlined text-primary">logout</span> 
 </div>
 </div>
 </div>
 </nav>
 );
};

