export function Process() {
  return (
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
  );
}