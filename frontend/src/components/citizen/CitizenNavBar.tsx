import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

export const CitizenNavBar = () => {
 const user = useAuthStore((state) => state.user);

 const getUserBadge = (points: number = 0) => {
   if (points >= 300) return { title: 'Community Hero', icon: '👑', color: 'bg-amber-100 text-amber-800 border-amber-300' };
   if (points >= 150) return { title: 'Sanitation Savior', icon: '🔮', color: 'bg-purple-100 text-purple-800 border-purple-300' };
   if (points >= 50) return { title: 'Pothole Patrol', icon: '⚔️', color: 'bg-orange-100 text-orange-800 border-orange-300' };
   return { title: 'Civic Scout', icon: '🛡️', color: 'bg-slate-100 text-slate-800 border-slate-300' };
 };

 const badge = getUserBadge(user?.points);

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
 <div 
 className="flex items-center gap-2 p-1.5 pl-4 pr-3 rounded-full border border-outline-variant/20 hover:bg-slate-50 cursor-pointer" 
 onClick={() => useAuthStore.getState().logout()}
 >
 <div className="flex flex-col items-end sm:mr-1">
 <span className="text-xs font-black text-primary leading-none">
 {user ? (user.name || user.email.split('@')[0]) : 'Citizen'}
 </span>
 {user && (
 <span className={`text-[9px] font-bold ${badge.color} px-1.5 py-0.5 rounded-full mt-0.5 border flex items-center gap-0.5`}>
 {badge.icon} {badge.title} ({user.points || 0} pts)
 </span>
 )}
 </div>
 <span className="material-symbols-outlined text-primary text-xl">logout</span> 
 </div>
 </div>
 </div>
 </nav>
 );
};
