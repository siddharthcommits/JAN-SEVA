import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Link } from 'react-router-dom';

interface LeaderboardEntry {
  _id: string;
  name: string;
  email: string;
  points: number;
  issuesResolved: number;
  wardId?: { name: string; wardNumber: number; city: string };
  departmentId?: { name: string };
}

export const LeaderboardPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/authority/leaderboard');
        if (res.data?.data) {
          setLeaderboard(res.data.data);
        }
      } catch {
        // silently fail  
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchLeaderboard();
  }, [isAuthenticated]);

  const getMedalColor = (rank: number) => {
    if (rank === 0) return 'from-yellow-400 to-amber-500';
    if (rank === 1) return 'from-slate-300 to-slate-400';
    if (rank === 2) return 'from-orange-300 to-orange-500';
    return 'from-primary/20 to-primary/10';
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_24px_48px_-12px_rgba(0,30,64,0.08)]">
        <div className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/home" className="text-2xl font-black text-primary font-['Manrope']">Jan Seva</Link>
            <span className="text-sm font-bold text-secondary uppercase tracking-widest">Leaderboard</span>
          </div>
          <Link to="/home" className="px-5 py-2.5 bg-surface-container-low text-primary font-bold text-sm rounded-xl hover:bg-surface-container transition-colors">
            ← Back to Feed
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto pt-28 pb-16 px-4 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-primary mb-3 font-['Manrope']">Authority Leaderboard</h1>
          <p className="text-slate-500 text-lg">Top-performing civic authorities ranked by issues resolved</p>
        </div>

        {/* Top 3 Podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[1, 0, 2].map((rankIdx) => {
              const entry = leaderboard[rankIdx];
              if (!entry) return null;
              return (
                <div
                  key={entry._id}
                  className={`bg-surface-container-lowest rounded-3xl p-6 text-center shadow-lg border border-slate-100 ${
                    rankIdx === 0 ? 'ring-2 ring-amber-400 transform scale-105' : ''
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getMedalColor(rankIdx)} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                    {getMedalIcon(rankIdx)}
                  </div>
                  <h3 className="text-lg font-black text-primary truncate">{entry.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 truncate">{entry.departmentId?.name || 'General'}</p>
                  <div className="mt-4 flex justify-center gap-6">
                    <div>
                      <p className="text-2xl font-black text-secondary">{entry.points}</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Points</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-primary">{entry.issuesResolved}</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Resolved</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full List */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry._id}
                  className={`flex items-center gap-4 p-5 hover:bg-slate-50/80 transition-colors ${i < 3 ? 'bg-gradient-to-r from-transparent to-amber-50/30' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                    i < 3 ? `bg-gradient-to-br ${getMedalColor(i)} text-white` : 'bg-primary/10 text-primary'
                  }`}>
                    {i < 3 ? getMedalIcon(i) : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{entry.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {entry.departmentId?.name || 'General'}
                      {entry.wardId ? ` • ${entry.wardId.name}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-secondary">{entry.points} pts</p>
                    <p className="text-xs text-slate-400">{entry.issuesResolved} resolved</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-3 block text-slate-300">leaderboard</span>
              <p>No leaderboard data yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
