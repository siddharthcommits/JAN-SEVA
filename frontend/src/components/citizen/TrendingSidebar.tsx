import { useState, useEffect } from 'react';
import { api } from '../../lib/axios';

interface TrendingIssue {
  _id: string;
  title: string;
  upvotes: number;
  category: string;
}

const categoryIcons: Record<string, string> = {
  road: '🛣️',
  garbage: '🗑️',
  sewage: '🚰',
  water: '💧',
  electricity: '⚡',
};

export const TrendingSidebar = () => {
  const [trending, setTrending] = useState<TrendingIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/issues', { params: { sort: 'upvotes', limit: 5 } });
        if (res.data?.data) {
          setTrending(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to fetch trending issues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <aside className="hidden md:block col-span-4 lg:col-span-3 py-4 space-y-8">
      {/* Location Card */}
      <div className="bg-primary p-8 rounded-[2rem] text-on-primary shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Current Ward</p>
            <h4 className="text-xl font-bold leading-tight">Your Area</h4>
          </div>
          <span className="material-symbols-outlined text-blue-300">explore</span>
        </div>
        <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md">
          Change Location
        </button>
      </div>

      {/* Trending Issues */}
      <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">bolt</span>
          Trending Issues
        </h4>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-4">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            </div>
          ) : trending.length > 0 ? (
            trending.map((trend, i) => (
              <div key={trend._id} className="flex gap-4 group cursor-pointer">
                <span className="text-2xl font-black text-slate-200 group-hover:text-secondary transition-colors w-8 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary line-clamp-1">
                    {categoryIcons[trend.category] || ''} {trend.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{trend.upvotes} Upvotes</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center">No trending issues</p>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-surface-container-low p-8 rounded-[2rem] border border-slate-100">
        <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          {['Roads', 'Garbage', 'Sewage', 'Water', 'Electricity'].map(filter => (
            <button key={filter} className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
              {filter}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
