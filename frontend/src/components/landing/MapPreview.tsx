export function MapPreview() {
 return (
 <section className="py-24 md:py-32 bg-white">
 <div className="max-w-7xl mx-auto px-6 md:px-8">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
 <div className="max-w-2xl">
 <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary mb-4 md:mb-6">Real-Time Civic Map</h2>
 <p className="text-slate-500 text-base md:text-lg font-light">Experience the pulse of your neighborhood. Active monitoring provides total transparency.</p>
 </div>
 <div className="flex gap-2 p-1.5 bg-slate-100 rounded-full shrink-0">
 <button className="px-5 md:px-6 py-2 rounded-full bg-white text-primary font-bold shadow-sm text-xs md:text-sm">Map View</button>
 <button className="px-5 md:px-6 py-2 rounded-full text-slate-500 font-medium text-xs md:text-sm hover:text-primary transition-colors">List View</button>
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
 {/* Glowing Pin 1 */}
 <div className="absolute top-[35%] left-[30%] md:left-[42%] flex flex-col items-center pointer-events-auto">
 <div className="bg-slate-900/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-red-500/30 flex items-center gap-2 md:gap-3 animate-pulse">
 <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 marker-glow"></span>
 <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Water Leak</span>
 </div>
 <div className="w-px h-6 md:h-8 bg-gradient-to-b from-red-500 to-transparent"></div>
 </div>
 
 {/* Glowing Pin 2 */}
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
 );
}