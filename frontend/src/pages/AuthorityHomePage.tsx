import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { api } from '../lib/axios';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const getMarkerColor = (upvotes: number): string => {
  if (upvotes >= 16) return '#ef4444'; // red - critical
  if (upvotes >= 6) return '#f59e0b';  // amber - moderate
  return '#22c55e';                     // green - low
};

const getSeverityLabel = (upvotes: number): string => {
  if (upvotes >= 16) return 'Critical';
  if (upvotes >= 6) return 'Moderate';
  return 'Low';
};

export const AuthorityHomePage = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  if (!isAuthenticated || (user?.role !== 'authority' && user?.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issuesRes, leaderboardRes] = await Promise.all([
        api.get('/authority/issues'),
        api.get('/authority/leaderboard')
      ]);
      if (issuesRes.data?.data) {
        setIssues(issuesRes.data.data);
      }
      if (leaderboardRes.data?.data) {
        setLeaderboard(leaderboardRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch authority data", error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.post(`/issues/${id}/resolve`);
      toast.success('Issue resolved successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resolve issue');
    }
  };

  // Calculate map center from issues
  const getMapCenter = (): [number, number] => {
    const openIssues = issues.filter(i => i.location?.coordinates);
    if (openIssues.length === 0) return [40.7306, -73.9352]; // default NYC
    const avgLat = openIssues.reduce((sum, i) => sum + (i.location.coordinates[1] || 0), 0) / openIssues.length;
    const avgLng = openIssues.reduce((sum, i) => sum + (i.location.coordinates[0] || 0), 0) / openIssues.length;
    return [avgLat, avgLng];
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen pb-12">
      {/* Nav */}
      <nav className="fixed w-full top-0 z-[1000] bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container-low px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-primary ml-4">JanSeva <span className="text-secondary tracking-widest text-sm uppercase">Authority</span></h1>
        <div className="flex gap-4 items-center">
          {/* View Toggle */}
          <div className="flex bg-surface-container-low rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                viewMode === 'map' ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">map</span>
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                viewMode === 'list' ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">list</span>
              List
            </button>
          </div>
          <span className="font-semibold text-sm hidden sm:inline-block">Welcome, {user?.name || user?.email}</span>
          <button onClick={logout} className="px-4 py-2 bg-error/10 text-error rounded-xl font-bold text-sm hover:bg-error/20 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto pt-24 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <section className="md:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">
              {viewMode === 'map' ? 'map' : 'assignment'}
            </span>
            {viewMode === 'map' ? 'Issue Map' : 'Assigned Issues'}
          </h2>

          {loading ? (
            <div className="flex justify-center p-8">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            </div>
          ) : viewMode === 'map' ? (
            /* ---- MAP VIEW ---- */
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100" style={{ height: '600px' }}>
              {issues.length > 0 ? (
                <MapContainer
                  center={getMapCenter()}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  {issues.map(issue => {
                    if (!issue.location?.coordinates) return null;
                    const [lng, lat] = issue.location.coordinates;
                    const color = getMarkerColor(issue.upvotes);
                    const severity = getSeverityLabel(issue.upvotes);

                    return (
                      <CircleMarker
                        key={issue._id}
                        center={[lat, lng]}
                        radius={Math.min(8 + issue.upvotes * 0.5, 20)}
                        fillColor={color}
                        color={color}
                        weight={2}
                        opacity={0.9}
                        fillOpacity={0.6}
                      >
                        <Popup>
                          <div className="min-w-[220px] font-['Inter']">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white`} style={{ backgroundColor: color }}>
                                {severity}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {issue.status}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 mb-1">{issue.title}</h3>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{issue.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                              <span>👤 {issue.reportedBy?.name || 'Unknown'}</span>
                              <span>👍 {issue.upvotes} upvotes</span>
                            </div>
                            {issue.status === 'open' && (
                              <button
                                onClick={() => handleResolve(issue._id)}
                                className="w-full px-3 py-2 bg-[#001e40] text-white font-bold text-xs rounded-lg hover:bg-[#001e40]/90 transition-colors"
                              >
                                ✓ Mark Resolved
                              </button>
                            )}
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50">
                  <div className="text-center text-slate-500">
                    <span className="material-symbols-outlined text-5xl mb-3 block text-slate-300">map</span>
                    <p className="font-medium">No issues assigned to your area</p>
                  </div>
                </div>
              )}

              {/* Map Legend */}
              {issues.length > 0 && (
                <div className="absolute bottom-6 left-6 z-[500] bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Severity</p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-xs text-slate-600">Low (0-5 upvotes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-xs text-slate-600">Moderate (6-15)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="text-xs text-slate-600">Critical (16+)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ---- LIST VIEW ---- */
            issues.length > 0 ? (
              issues.map(issue => (
                <div key={issue._id} className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary text-[10px] font-bold uppercase rounded-md">{issue.category}</span>
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getMarkerColor(issue.upvotes) }}
                          title={`${getSeverityLabel(issue.upvotes)} severity`}
                        ></span>
                      </div>
                      <h3 className="text-lg font-bold text-primary">{issue.title}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{issue.description}</p>
                  {issue.images && issue.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {issue.images.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="" className="h-20 w-20 rounded-xl object-cover shrink-0" />
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500 font-medium">
                      Reported by: {issue.reportedBy?.name || 'Unknown'} • Upvotes: {issue.upvotes}
                    </div>
                    {issue.status === 'open' && (
                      <button
                        onClick={() => handleResolve(issue._id)}
                        className="px-6 py-2 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 bg-surface-container-low rounded-2xl text-center text-slate-500 font-medium">No assigned issues found.</div>
            )
          )}
        </section>

        {/* Sidebar - Leaderboard */}
        <section className="col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">leaderboard</span>
            Leaderboard
          </h2>
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
            ) : leaderboard.length > 0 ? (
              <div className="flex flex-col">
                {leaderboard.map((u, i) => (
                  <div key={u._id} className={`flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${u._id === user?._id ? 'bg-primary/5' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-primary/10 text-primary'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800">{u.name} {u._id === user?._id && <span className="text-[10px] text-primary">(You)</span>}</p>
                      <p className="text-xs text-slate-500">{u.issuesResolved} resolved</p>
                    </div>
                    <div className="font-black text-secondary text-sm">
                      {u.points} pts
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">No data available</div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-primary p-6 rounded-2xl text-on-primary shadow-lg">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-3">Your Stats</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-black">{user?.points || 0}</p>
                <p className="text-xs text-blue-200">Points</p>
              </div>
              <div>
                <p className="text-3xl font-black">{user?.issuesResolved || 0}</p>
                <p className="text-xs text-blue-200">Resolved</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};