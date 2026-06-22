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

  // AI-powered feature states
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  // Resolution states
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [resolutionPreviews, setResolutionPreviews] = useState<string[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [resolutionUploading, setResolutionUploading] = useState(false);

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

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const res = await api.get('/ai/ward-insights');
      if (res.data?.data) {
        setInsights(res.data.data);
        toast.success('AI Ward Insights generated!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to generate insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = (id: string) => {
    setResolvingIssueId(id);
    setResolutionFiles([]);
    setResolutionPreviews([]);
    setVerificationFeedback('');
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

        {/* Sidebar - Leaderboard & AI Insights */}
        <section className="col-span-1 flex flex-col gap-6">
          {/* AI Ward Insights */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 rounded-3xl text-white shadow-xl flex flex-col gap-4 border border-blue-800/30">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-amber-400">auto_awesome</span>
              Predictive Ward Insights
            </h3>
            <p className="text-xs text-blue-200 leading-relaxed font-medium">
              Analyze all reported issues in your ward using Gemini to identify hotspots, track trends, and plan resource allocation.
            </p>
            {insightsLoading ? (
              <div className="flex justify-center py-4">
                <span className="material-symbols-outlined animate-spin text-white text-2xl">progress_activity</span>
              </div>
            ) : insights ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={fetchInsights}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  🔄 Regenerate Reports
                </button>
                
                <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-3 border border-white/10 max-h-[300px] overflow-y-auto text-xs scrollbar-thin text-left">
                  <div>
                    <h4 className="font-bold text-amber-300 mb-1">Ward Summary</h4>
                    <p className="text-blue-100 font-normal leading-relaxed">{insights.summary}</p>
                  </div>
                  
                  {insights.criticalAreas && insights.criticalAreas.length > 0 && (
                    <div>
                      <h4 className="font-bold text-red-400 mb-1">Critical Areas</h4>
                      <ul className="list-disc pl-4 text-blue-100 font-normal space-y-1">
                        {insights.criticalAreas.map((area: string, i: number) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-blue-300 mb-1">Trend Analysis</h4>
                    <p className="text-blue-100 font-normal leading-relaxed">{insights.trendAnalysis}</p>
                  </div>

                  {insights.resourceAllocationRecommendations && insights.resourceAllocationRecommendations.length > 0 && (
                    <div>
                      <h4 className="font-bold text-emerald-400 mb-1">Resource Recommendations</h4>
                      <ul className="list-decimal pl-4 text-blue-100 font-normal space-y-1">
                        {insights.resourceAllocationRecommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={fetchInsights}
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border-0"
              >
                <span className="material-symbols-outlined text-sm">analytics</span>
                Generate AI Insights
              </button>
            )}
          </div>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2 mt-4">
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

      {/* Resolve Issue Modal */}
      {resolvingIssueId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest text-on-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-primary">Provide Resolution Proof</h3>
              <button 
                onClick={() => {
                  setResolvingIssueId(null);
                  setResolutionFiles([]);
                  setResolutionPreviews([]);
                  setVerificationFeedback('');
                }}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Upload a photograph confirming the resolution (e.g. clean road, filled pothole). Gemini will compare this photo with the original complaint photo to verify completion.
            </p>

            {/* Proof Upload Area */}
            <div 
              onClick={() => {
                const el = document.getElementById('res-file-input');
                el?.click();
              }}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="material-symbols-outlined text-3xl text-slate-400 mb-2 block">upload_file</span>
              <p className="text-sm text-slate-600 font-bold">Select resolution photo</p>
              <p className="text-xs text-slate-400 mt-1">Image size up to 5MB</p>
            </div>
            <input 
              id="res-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  setResolutionFiles(files);
                  setResolutionPreviews(files.map(f => URL.createObjectURL(f)));
                }
              }}
            />

            {/* Previews */}
            {resolutionPreviews.length > 0 && (
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mt-2 bg-slate-50 border border-slate-100">
                <img src={resolutionPreviews[0]} alt="Resolution Proof" className="w-full h-full object-cover" />
                <button 
                  onClick={() => {
                    setResolutionFiles([]);
                    setResolutionPreviews([]);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            )}

            {/* AI Rejection Feedback */}
            {verificationFeedback && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs leading-relaxed font-semibold">
                ⚠️ AI Verification Failed: "{verificationFeedback}"
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setResolvingIssueId(null);
                  setResolutionFiles([]);
                  setResolutionPreviews([]);
                  setVerificationFeedback('');
                }}
                className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                disabled={resolutionFiles.length === 0 || isResolving || resolutionUploading}
                onClick={async () => {
                  setIsResolving(true);
                  setVerificationFeedback('');
                  const tId = toast.loading('Uploading proof and verifying with Gemini...');
                  
                  try {
                    // Upload proof image
                    setResolutionUploading(true);
                    const authRes = await api.get('/imagekit/auth');
                    const authParams = authRes.data?.data;
                    
                    const file = resolutionFiles[0];
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('fileName', `resolved_${Date.now()}_${file.name}`);
                    formData.append('publicKey', 'public_O6ij2BGxhFwuRCv75GQfnAIn4jw=');
                    formData.append('signature', authParams.signature);
                    formData.append('expire', String(authParams.expire));
                    formData.append('token', authParams.token);

                    const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                      method: 'POST',
                      body: formData,
                    });

                    if (!uploadRes.ok) throw new Error('Proof photo upload failed');
                    const uploadResult = await uploadRes.json();
                    const proofUrl = uploadResult.url;
                    setResolutionUploading(false);

                    // Call backend verification
                    toast.loading('Gemini is inspecting the resolution...', { id: tId });
                    const res = await api.post('/ai/verify-resolution', {
                      issueId: resolvingIssueId,
                      resolutionImages: [proofUrl],
                    });

                    const data = res.data?.data;
                    if (data?.verified) {
                      toast.success(`Success! Points earned: +${data.pointsEarned}. AI verification score: ${data.qualityScore}/10`, { id: tId, duration: 6000 });
                      setResolvingIssueId(null);
                      setResolutionFiles([]);
                      setResolutionPreviews([]);
                      fetchData();
                    } else {
                      toast.error('AI Verification failed!', { id: tId });
                      setVerificationFeedback(data?.reasoning || 'Proof does not match/resolve the issue.');
                    }
                  } catch (err: any) {
                    console.error(err);
                    toast.error(err?.response?.data?.message || 'Verification process failed', { id: tId });
                  } finally {
                    setIsResolving(false);
                    setResolutionUploading(false);
                  }
                }}
                className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow flex items-center gap-2 disabled:opacity-50 cursor-pointer border-0"
              >
                {isResolving ? 'Verifying...' : 'Submit Proof'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};