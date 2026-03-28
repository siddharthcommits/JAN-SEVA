export function Hero() {
  return (
    <header className="pt-28 pb-20 md:pt-32 md:pb-32 hero-gradient relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Softer, more minimalist abstract background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        <div className="lg:col-span-6 text-center lg:text-left">
          <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 md:mb-8">
            Empowering <span className="text-secondary">Citizens.</span><br/>
            Improving <span className="font-light opacity-90 italic">Cities.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
            Jan Seva connects citizens with municipal authorities to report, track, and resolve local problems through a clean digital infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-[1rem] hover:scale-105 transition-all premium-shadow flex items-center justify-center gap-3">
              <span className="material-symbols-outlined">campaign</span>
              Get Started
            </button>
            <button className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full font-bold text-[1rem] hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              <span className="material-symbols-outlined">explore</span>
              Live Map
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-6 mt-12 lg:mt-0 px-4 sm:px-0">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-secondary/10 to-indigo-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative bg-primary-container/30 backdrop-blur-sm rounded-[2rem] p-3 border border-white/5 premium-shadow">
              <img 
                className="rounded-[1.5rem] w-full aspect-[4/3] object-cover opacity-90" 
                alt="Modern 3D city map interface on a device" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm6Yr6vkgFzSLycFK24FJrqD-9mHc3YLifhKumFMl8CSxa9K23lAtZUU8EOTimVMFpdgFuLh0e2x5_jlKQlZ3zfn4G5qIDhvAcD_G8nmI5RiQefdH3MoOPYtwk3p6S2WmZFaccJpHhr3KXyJixP5svv7BAV6BtrTZCHMHPZ2H2DMI_JsVd-WoTC2VNZilCtMPyrgXngDLs_n4aNsUuSnkZsEhMrO91d9BGdbfofYcwtwyoPSXoBXuoBogrQURQ0YOZ9vSmJadpSKz3"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}