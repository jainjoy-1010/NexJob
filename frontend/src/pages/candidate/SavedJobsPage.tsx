import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { JobCard } from '../../components/job/JobCard';
import { EmptyState } from '../../components/common/EmptyState';
import { JobCardSkeleton } from '../../components/common/Skeletons';
import { Job } from '../../types';
import { Bookmark } from 'lucide-react';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService.getSavedJobs()
      .then(setSavedJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveToggle = (jobId: number, isSaved: boolean) => {
    if (!isSaved) {
      setSavedJobs(prev => prev.filter(j => j.id !== jobId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Saved Jobs</h1>
        <p className="text-sm text-slate-500 mt-1">Jobs you've bookmarked for later review.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Bookmark jobs you're interested in and come back later. Press the bookmark icon on any job card."
          actionLabel="Browse Jobs"
          actionTo="/"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map(job => (
            <JobCard key={job.id} job={{ ...job, isSavedByCandidate: true }} onSaveToggle={handleSaveToggle} />
          ))}
        </div>
      )}
    </div>
  );
};
