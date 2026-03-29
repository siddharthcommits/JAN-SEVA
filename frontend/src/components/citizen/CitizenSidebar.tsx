export const CitizenSidebar = () => {
 return (
 <aside className="hidden lg:block col-span-2 py-4">
 <div className="sticky top-28 flex flex-col gap-1">
 <div className="px-4 py-2 mb-4">
 <h2 className="text-lg font-bold text-[#001e40]">Citizen Portal</h2>
 <p className="text-xs text-slate-500">Jan Seva Civic Tech</p>
 </div>
 
 <a className="flex items-center gap-3 bg-[#91f78e]/20 text-[#006e1c] rounded-xl px-4 py-3 hover:translate-x-1 transition-transform"href="#">
 <span className="material-symbols-outlined"style={{ fontVariationSettings:"'FILL' 1"}}>home</span>
 <span className="font-medium">Home</span>
 </a>
 <a className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:bg-slate-200/50 rounded-xl hover:translate-x-1 transition-transform"href="#">
 <span className="material-symbols-outlined">trending_up</span>
 <span className="font-medium">Popular</span>
 </a>
 <a className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:bg-slate-200/50 rounded-xl hover:translate-x-1 transition-transform"href="#">
 <span className="material-symbols-outlined">topic</span>
 <span className="font-medium">Topics</span>
 </a>
 <a className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:bg-slate-200/50 rounded-xl hover:translate-x-1 transition-transform"href="#">
 <span className="material-symbols-outlined">assignment</span>
 <span className="font-medium">My Reports</span>
 </a>
 <a className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:bg-slate-200/50 rounded-xl hover:translate-x-1 transition-transform"href="#">
 <span className="material-symbols-outlined">settings</span>
 <span className="font-medium">Settings</span>
 </a>

 <div className="mt-8 pt-8 border-t border-slate-200">
 <p className="px-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Support</p>
 <a className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-primary transition-colors"href="#">
 <span className="material-symbols-outlined text-sm">security</span>
 <span className="text-xs">Privacy</span>
 </a>
 <a className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-primary transition-colors"href="#">
 <span className="material-symbols-outlined text-sm">description</span>
 <span className="text-xs">Terms</span>
 </a>
 </div>
 </div>
 </aside>
 );
};
