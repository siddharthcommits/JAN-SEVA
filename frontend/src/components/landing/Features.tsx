export function Features() {
 return (
 <section className="py-24 md:py-32 bg-slate-50/50 border-y border-slate-100">
 <div className="max-w-7xl mx-auto px-6 md:px-8">
 <div className="max-w-3xl mb-16 md:mb-24">
 <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary mb-6">Modern Civic Management</h2>
 <p className="text-slate-500 text-lg md:text-xl font-light leading-relaxed">Sophisticated yet minimal features designed to bridge the gap between citizen needs and administrative actions.</p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
 {/* Feature 1 */}
 <div className="md:col-span-4 glass-card p-8 md:p-10 rounded-2xl md:rounded-3xl premium-hover group">
 <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
 <span className="material-symbols-outlined text-xl md:text-2xl">location_on</span>
 </div>
 <h4 className="font-headline font-bold text-lg md:text-xl mb-3">Geo-tagging</h4>
 <p className="text-slate-500 font-light text-sm leading-relaxed">Precision GPS integration for accurate field navigation and resource allocation.</p>
 </div>
 
 {/* Feature 2 */}
 <div className="md:col-span-4 glass-card p-8 md:p-10 rounded-2xl md:rounded-3xl premium-hover group">
 <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
 <span className="material-symbols-outlined text-xl md:text-2xl">photo_camera</span>
 </div>
 <h4 className="font-headline font-bold text-lg md:text-xl mb-3">Media Evidence</h4>
 <p className="text-slate-500 font-light text-sm leading-relaxed">Secure upload of visual evidence to provide authorities with context and scale.</p>
 </div>
 
 {/* Feature 3 */}
 <div className="md:col-span-4 glass-card p-8 md:p-10 rounded-2xl md:rounded-3xl premium-hover group">
 <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
 <span className="material-symbols-outlined text-xl md:text-2xl">how_to_reg</span>
 </div>
 <h4 className="font-headline font-bold text-lg md:text-xl mb-3">Social Voting</h4>
 <p className="text-slate-500 font-light text-sm leading-relaxed">Democratic prioritization allows the community to signal urgency on critical issues.</p>
 </div>
 
 {/* Feature 4 - Large */}
 <div className="md:col-span-12 lg:col-span-7 glass-card p-8 md:p-12 rounded-2xl md:rounded-3xl premium-hover group flex flex-col md:flex-row gap-8 md:gap-10 items-center">
 <div className="flex-1">
 <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
 <span className="material-symbols-outlined text-xl md:text-2xl">analytics</span>
 </div>
 <h4 className="font-headline font-bold text-xl md:text-2xl mb-4">Smart Analytics</h4>
 <p className="text-slate-500 font-light leading-relaxed mb-0">Heatmaps and density analytics reveal chronic problem zones, enabling proactive maintenance strategies with minimal noise.</p>
 </div>
 <div className="w-full md:w-2/5 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
 <img 
 className="w-full h-48 md:h-56 object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
 alt="Analytics dashboard"
 src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1Cxkosism6NmKlRydQvPYIGwAqVQ5Y9U33mQ9KGPEzZw07uCo3ZsLEgEMQnBzomsG3Oeyqv0R9PCvzwMok6_dxD7a2ECIS1PesE99jjDkFh6MWwJYNDV1b3KTZwjilV_CRvqqTEpCLKvV7ZAQ3j-cxpUjf8ss8eGgmFFJDp-SUc1JZHYV5q8eTogEwDFaKoAJFUK60K04glzGPi1ubylpSbLYM5tJ3PRcRzMul8WjG5zpIdxeVcY3LKo2B2fpT9xuGrGsMkf6qCXC"
 />
 </div>
 </div>
 
 {/* Feature 5 */}
 <div className="md:col-span-12 lg:col-span-5 glass-card p-8 md:p-12 rounded-2xl md:rounded-3xl premium-hover group">
 <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
 <span className="material-symbols-outlined text-xl md:text-2xl">update</span>
 </div>
 <h4 className="font-headline font-bold text-xl md:text-2xl mb-4">Real-time Status</h4>
 <p className="text-slate-500 font-light leading-relaxed">Transparent tracking from submission to resolution ensures accountability and citizen trust globally.</p>
 </div>
 </div>
 </div>
 </section>
 );
}