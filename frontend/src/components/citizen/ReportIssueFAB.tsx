import { useState } from 'react';
import { ReportIssueModal } from './ReportIssueModal';

export const ReportIssueFAB = ({ onIssueReported }: { onIssueReported?: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 flex items-center gap-3 bg-secondary text-on-secondary px-8 py-5 rounded-full shadow-[0_24px_48px_-12px_rgba(14,165,233,0.4)] hover:shadow-[0_24px_48px_-12px_rgba(14,165,233,0.6)] active:scale-95 transition-all z-[60] group"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
        <span className="text-lg font-black font-['Manrope'] hidden sm:inline-block">Report Issue</span>      
      </button>

      <ReportIssueModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          if (onIssueReported) onIssueReported();
        }}
      />
    </>
  );
};