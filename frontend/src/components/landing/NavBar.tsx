export function NavBar() {
 return (
 <nav className="fixed top-0 w-full z-50 glass-nav">
 <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-8 h-20">
 <div className="text-2xl font-extrabold text-primary tracking-tight font-headline flex items-center gap-2">
 <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
 <span className="material-symbols-outlined text-white text-lg">domain</span>
 </span>
 Jan Seva
 </div>
 
 <div className="hidden md:flex items-center space-x-10">
 <a className="font-headline font-semibold text-sm text-primary relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary"href="#">Home</a>
 <a className="font-headline font-medium text-sm text-slate-500 hover:text-primary transition-colors"href="#">Issues</a>
 <a className="font-headline font-medium text-sm text-slate-500 hover:text-primary transition-colors"href="#">Map</a>
 <a className="font-headline font-medium text-sm text-slate-500 hover:text-primary transition-colors"href="#">About</a>
 </div>
 
 <div className="flex items-center gap-4">
 <button className="hidden md:flex bg-secondary text-white px-7 py-2.5 rounded-full font-bold text-sm hover:brightness-105 transition-all premium-shadow flex items-center gap-2">
 <span className="material-symbols-outlined text-sm">add_circle</span>
 Report an Issue
 </button>
 
 <button className="md:hidden text-primary p-2">
 <span className="material-symbols-outlined text-3xl">menu</span>
 </button>
 </div>
 </div>
 </nav>
 );
}