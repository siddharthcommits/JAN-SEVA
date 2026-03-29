export function Footer() {
 return (
 <>
 <section className="py-24 md:py-32 relative bg-slate-50 overflow-hidden">
 <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
 <span className="material-symbols-outlined text-[30rem] md:text-[60rem]">public</span>
 </div>
 <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10">
 <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-6 md:mb-10 leading-tight">
 Better Cities, <br className="md:hidden"/><span className="italic font-light">Built Together.</span>
 </h2>
 <p className="text-lg md:text-xl text-slate-500 mb-10 md:mb-16 font-light max-w-2xl mx-auto">
 Join the movement for transparent, efficient, and modern civic management in your neighborhood.
 </p>
 <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
 <button className="bg-primary text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg hover:bg-slate-800 transition-all premium-shadow flex items-center justify-center gap-3">
 <span className="material-symbols-outlined text-xl">rocket_launch</span>
 Get Started Now
 </button>
 <button className="bg-white border border-slate-200 text-primary px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
 View Demo
 </button>
 </div>
 </div>
 </section>

 <footer className="w-full pt-20 md:pt-24 pb-12 bg-white border-t border-slate-100">
 <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-24">
 <div className="col-span-1 sm:col-span-2 md:col-span-1">
 <div className="text-2xl font-extrabold text-primary mb-6 tracking-tight flex items-center gap-2">
 <span className="w-6 h-6 bg-primary rounded flex items-center justify-center">
 <span className="material-symbols-outlined text-white text-xs">domain</span>
 </span>
 Jan Seva
 </div>
 <p className="font-body text-sm text-slate-500 leading-relaxed font-light">
 A minimalist civic-tech ecosystem dedicated to fostering transparency and excellence in urban governance.
 </p>
 </div>
 <div>
 <h4 className="font-bold text-primary text-xs uppercase tracking-widest mb-6 md:mb-8">Navigation</h4>
 <div className="flex flex-col gap-3 md:gap-4">
 <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light"href="#">Our Platform</a>
 <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light"href="#">City Map</a>
 <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light"href="#">Success Stories</a>
 <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light"href="#">Resources</a>
 </div>
 </div>
 <div>
 <h4 className="font-bold text-primary text-xs uppercase tracking-widest mb-6 md:mb-8">Transparency</h4>
 <div className="flex flex-col gap-3 md:gap-4">
 <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light"href="#">Data Privacy</a>
 <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light"href="#">Governance</a>
 <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light"href="#">Public APIs</a>
 <a className="text-sm text-slate-500 hover:text-primary transition-colors font-light"href="#">Terms of Use</a>
 </div>
 </div>
 <div className="sm:col-span-2 md:col-span-1">
 <h4 className="font-bold text-primary text-xs uppercase tracking-widest mb-6 md:mb-8">Newsletter</h4>
 <p className="text-sm text-slate-500 mb-6 font-light">Stay updated with city-wide reports.</p>
 <div className="flex flex-col gap-2 md:gap-3">
 <input className="bg-slate-50 border border-slate-100 rounded-full px-5 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-none w-full"placeholder="Email address"type="email"/>
 <button className="bg-primary text-white py-3 rounded-full text-sm font-bold hover:bg-slate-800 transition-all w-full">Subscribe</button>
 </div>
 </div>
 </div>
 <div className="max-w-7xl mx-auto px-6 md:px-8 pt-8 md:pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
 <p className="font-body text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">© 2024 Jan Seva Platform. All rights reserved.</p>
 <div className="flex gap-6 md:gap-8">
 <a className="text-slate-400 hover:text-primary transition-colors"href="#"><span className="material-symbols-outlined text-lg md:text-xl">share</span></a>
 <a className="text-slate-400 hover:text-primary transition-colors"href="#"><span className="material-symbols-outlined text-lg md:text-xl">alternate_email</span></a>
 <a className="text-slate-400 hover:text-primary transition-colors"href="#"><span className="material-symbols-outlined text-lg md:text-xl">language</span></a>
 </div>
 </div>
 </footer>
 </>
 );
}