export function Stats() {
  return (
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
  );
}