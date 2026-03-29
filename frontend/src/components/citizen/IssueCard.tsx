import React, { useState } from 'react';
import { api } from '../../lib/axios';
import toast from 'react-hot-toast';

interface IssueCardProps {
 id: string;
 category: string;
 categoryColors: { bg: string; text: string };
 location: string;
 distance: string;
 status: string;
 statusColors: { bg: string; text: string; dot: string };
 title: string;
 description: string;
 imageUrl?: string;
 upvotes: number;
 commentCount: number;
 reportedBy: string;
 reporterAvatar?: string;
 timeAgo: string;
 isCritical?: boolean;
}

interface Comment {
  _id: string;
  text: string;
  userId: { _id: string; name: string; email: string; avatar?: string };
  createdAt: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({
 id,
 category,
 categoryColors,
 location,
 distance,
 status,
 statusColors,
 title,
 description,
 imageUrl,
 upvotes: initialUpvotes,
 commentCount: initialCommentCount,
 reportedBy,
 reporterAvatar,
 timeAgo,
 isCritical
}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      const res = await api.post(`/issues/${id}/vote`, { vote: voteType });
      if (res.data?.data) {
        setUpvotes(res.data.data.upvotes - res.data.data.downvotes);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to vote');
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setShowComments(true);
      setLoadingComments(true);
      try {
        const res = await api.get(`/issues/${id}/comments`);
        if (res.data?.data) {
          setComments(res.data.data);
        }
      } catch {
        toast.error('Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    } else {
      setShowComments(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      const res = await api.post(`/issues/${id}/comments`, { text: commentText.trim() });
      if (res.data?.data) {
        setComments(prev => [res.data.data, ...prev]);
        setCommentCount(prev => prev + 1);
        setCommentText('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const timeSince = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

 return (
 <article className="flex bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,30,64,0.08)] group hover:-translate-y-1 transition-all duration-300 w-full flex-col">
   <div className="flex flex-col sm:flex-row">
     {/* Voting Sidebar */}
     <div className="sm:w-16 bg-surface-container-low flex sm:flex-col items-center py-4 sm:py-6 px-6 sm:px-0 gap-4 sm:gap-2 justify-between sm:justify-start border-b sm:border-b-0 sm:border-r border-slate-100">
       <div className="flex sm:flex-col items-center gap-2">
         <button onClick={() => handleVote('upvote')} className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-full transition-colors">
           <span className="material-symbols-outlined">arrow_upward</span>
         </button>
         <span className="font-black text-primary">{upvotes}</span>
         <button onClick={() => handleVote('downvote')} className="p-2 hover:bg-error/10 hover:text-error rounded-full transition-colors">
           <span className="material-symbols-outlined">arrow_downward</span>
         </button>
       </div>
       <div className="sm:hidden text-xs text-slate-500 font-medium">
         {timeAgo}
       </div>
     </div>

     {/* Post Content */}
     <div className="flex-1 p-6 sm:p-8">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
         <div className="flex flex-wrap items-center gap-3">
           <span className={`${categoryColors.bg} ${categoryColors.text} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
             {category}
           </span>
           <span className="flex items-center gap-1 text-slate-500 text-xs font-medium">  
             <span className="material-symbols-outlined text-sm">location_on</span>
             {location} • {distance}
           </span>
         </div>

         <div className="flex items-center gap-2">
           <span className={`flex items-center gap-1 ${statusColors.bg} ${statusColors.text} px-3 py-1 rounded-full text-xs font-bold`}>
             <span className={`w-2 h-2 rounded-full ${statusColors.dot}`}></span>
             {status}
           </span>
           {isCritical && <span className="w-2 h-2 rounded-full bg-error" title="Critical Severity"></span>}
         </div>
       </div>

       <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">
         {title}
       </h3>
       <p className="text-slate-600 mb-6 leading-relaxed text-sm sm:text-base">
         {description}
       </p>

       {imageUrl && (
         <div className="relative rounded-3xl overflow-hidden mb-6 aspect-video bg-slate-100">
           <img
             src={imageUrl}
             alt={title}
             className="w-full h-full object-cover"
           />
         </div>
       )}

       <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-slate-100 gap-4 sm:gap-0">
         <div className="flex items-center gap-4 text-slate-500">
           <button 
             onClick={toggleComments}
             className={`flex items-center gap-2 transition-colors ${showComments ? 'text-primary' : 'hover:text-primary'}`}
           >
             <span className="material-symbols-outlined text-lg sm:text-xl">chat_bubble</span>
             <span className="text-xs sm:text-sm font-semibold">{commentCount} Comments</span>
           </button>
           <button className="flex items-center gap-2 hover:text-primary transition-colors">
             <span className="material-symbols-outlined text-lg sm:text-xl">share</span>
             <span className="text-xs sm:text-sm font-semibold">Share</span>
           </button>
         </div>
         <div className="text-left sm:text-right hidden sm:flex items-center gap-2">
           {reporterAvatar && (
             <img src={reporterAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
           )}
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"> 
             Reported by {reportedBy} • {timeAgo}
           </p>
         </div>
       </div>
     </div>
   </div>

   {/* Comment Section */}
   {showComments && (
     <div className="border-t border-slate-100 bg-slate-50/50">
       {/* Comment Input */}
       <form onSubmit={handlePostComment} className="p-6 flex gap-3 border-b border-slate-100">
         <input
           type="text"
           value={commentText}
           onChange={(e) => setCommentText(e.target.value)}
           placeholder="Add a comment..."
           className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
         />
         <button
           type="submit"
           disabled={postingComment || !commentText.trim()}
           className="px-5 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
         >
           {postingComment ? '...' : 'Post'}
         </button>
       </form>

       {/* Comments List */}
       <div className="px-6 py-4 space-y-4 max-h-80 overflow-y-auto">
         {loadingComments ? (
           <div className="text-center py-4">
             <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
           </div>
         ) : comments.length > 0 ? (
           comments.map(comment => (
             <div key={comment._id} className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                 {comment.userId?.avatar ? (
                   <img src={comment.userId.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                 ) : (
                   comment.userId?.name?.charAt(0)?.toUpperCase() || '?'
                 )}
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex items-baseline gap-2">
                   <span className="text-sm font-bold text-slate-800">{comment.userId?.name || 'Anonymous'}</span>
                   <span className="text-[10px] text-slate-400">{timeSince(comment.createdAt)}</span>
                 </div>
                 <p className="text-sm text-slate-600 mt-0.5">{comment.text}</p>
               </div>
             </div>
           ))
         ) : (
           <p className="text-center text-sm text-slate-400 py-4">No comments yet. Be the first!</p>
         )}
       </div>
     </div>
   )}
 </article>
 );
};