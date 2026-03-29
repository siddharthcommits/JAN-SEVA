import { useState, useEffect } from 'react';
import { IssueCard } from './IssueCard';
import { api } from '../../lib/axios';

const categoryColorMap: Record<string, { bg: string; text: string }> = {
  road: { bg: 'bg-orange-100', text: 'text-orange-700' },
  garbage: { bg: 'bg-green-100', text: 'text-green-700' },
  sewage: { bg: 'bg-purple-100', text: 'text-purple-700' },
  water: { bg: 'bg-blue-100', text: 'text-blue-700' },
  electricity: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

const statusColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  open: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

type SortMode = 'new' | 'top' | 'upvoted' | 'unresolved';

export const IssueFeed = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('new');
  const [usingGeo, setUsingGeo] = useState(false);

  const timeSince = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  useEffect(() => {
    const fetchIssues = async (lat?: number, lng?: number) => {
      try {
        setLoading(true);
        let response;
        let params: Record<string, string> = {};

        if (sortMode === 'upvoted') params.sort = 'upvotes';
        if (sortMode === 'unresolved') params.status = 'open';

        if (lat && lng) {
          response = await api.get('/issues/nearby', {
            params: { latitude: lat, longitude: lng, radius: 10000, ...params }
          });
          setUsingGeo(true);
        } else {
          response = await api.get('/issues', { params });
          setUsingGeo(false);
        }

        if (response.data?.data) {
          let issueList = response.data.data;
          
          // Client-side sort for "top" which uses upvotes
          if (sortMode === 'top') {
            issueList = [...issueList].sort((a: any, b: any) => b.upvotes - a.upvotes);
          }

          const formattedIssues = issueList.map((issue: any) => ({
            id: issue._id,
            category: issue.category,
            categoryColors: categoryColorMap[issue.category] || categoryColorMap.road,
            location: issue.wardId?.name || 'Local Ward',
            distance: 'Nearby',
            status: issue.status,
            statusColors: statusColorMap[issue.status] || statusColorMap.open,
            title: issue.title,
            description: issue.description,
            imageUrl: issue.images?.[0],
            upvotes: issue.upvotes,
            commentCount: issue.commentCount || 0,
            reportedBy: issue.reportedBy?.name || 'Anonymous',
            reporterAvatar: issue.reportedBy?.avatar,
            timeAgo: timeSince(issue.createdAt),
          }));
          setIssues(formattedIssues);
        }
      } catch (err) {
        console.error("Failed to fetch issues", err);
      } finally {
        setLoading(false);
      }
    };

    // Try geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchIssues(pos.coords.latitude, pos.coords.longitude),
        () => fetchIssues(), // fallback to all issues
        { timeout: 5000 }
      );
    } else {
      fetchIssues();
    }
  }, [refreshTrigger, sortMode]);

  const sortButtons: { mode: SortMode; label: string }[] = [
    { mode: 'new', label: 'New' },
    { mode: 'top', label: 'Top' },
    { mode: 'upvoted', label: 'Upvoted' },
    { mode: 'unresolved', label: 'Unresolved' },
  ];

  return (
    <section className="col-span-12 md:col-span-8 lg:col-span-7 py-4">
      {/* Location indicator */}
      {usingGeo && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
          <span className="material-symbols-outlined text-sm">my_location</span>
          Showing issues near your location
        </div>
      )}

      {/* Sorting Header */}
      <div className="flex items-center justify-between mb-8 p-1 bg-surface-container-low rounded-2xl w-full overflow-x-auto">
        <div className="flex gap-1 overflow-x-auto no-scrollbar min-w-max">
          {sortButtons.map(btn => (
            <button
              key={btn.mode}
              onClick={() => setSortMode(btn.mode)}
              className={`px-6 py-2.5 font-medium rounded-xl transition-all whitespace-nowrap ${
                sortMode === btn.mode
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="flex flex-col gap-8 w-full">
        {loading ? (
          <div className="flex justify-center p-8">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : issues.length > 0 ? (
          issues.map(issue => (
            <IssueCard key={issue.id} id={issue.id} {...issue} />
          ))
        ) : (
          <div className="text-center p-8 bg-surface-container-low rounded-3xl text-slate-500">
            No issues found. Be the first to report!
          </div>
        )}
      </div>
    </section>
  );
};
