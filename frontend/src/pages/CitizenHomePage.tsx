import { useState } from 'react';
import { CitizenNavBar } from '../components/citizen/CitizenNavBar';
import { CitizenSidebar } from '../components/citizen/CitizenSidebar';
import { IssueFeed } from '../components/citizen/IssueFeed';
import { TrendingSidebar } from '../components/citizen/TrendingSidebar';        
import { ReportIssueFAB } from '../components/citizen/ReportIssueFAB';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export const CitizenHomePage = () => {
 const isAuthenticated = useAuthStore((state) => state.isAuthenticated);        
 const [refreshTrigger, setRefreshTrigger] = useState(0);

 if (!isAuthenticated) {
   return <Navigate to="/login"replace />;
 }

 return (
   <div className="bg-surface text-on-surface antialiased min-h-screen">
     <CitizenNavBar />

     {/* Main Content Grid */}
     <main className="max-w-screen-2xl mx-auto pt-20 sm:pt-24 px-4 sm:px-8 grid grid-cols-12 gap-4 sm:gap-8 min-h-screen">
       <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
         <CitizenSidebar />
       </div>
       <div className="col-span-12 lg:col-span-6 xl:col-span-7">
         <IssueFeed refreshTrigger={refreshTrigger} />
       </div>
       <div className="hidden lg:block lg:col-span-3 xl:col-span-3">
         <TrendingSidebar />
       </div>
     </main>

     <ReportIssueFAB onIssueReported={() => setRefreshTrigger(prev => prev + 1)} />
   </div>
 );
};