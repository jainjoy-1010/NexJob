import React, { useState, useEffect, useCallback } from 'react';
import { jobService } from '../../services/jobService';
import { JobCard } from '../../components/job/JobCard';
import { JobFilterBar } from '../../components/job/JobFilterBar';
import { JobCardSkeleton } from '../../components/common/Skeletons';
import { EmptyState } from '../../components/common/EmptyState';
import { Job } from '../../types';
import { JobFilterParams } from '../../services/jobService';
import { Search, SlidersHorizontal } from 'lucide-react';

export const JobListPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilterParams>({});
  const [showFilters, setShowFilters] = useState(false);

  const loadJobs = useCallback(async (params: JobFilterParams) => {
    setLoading(true);
    try {
      const data = await jobService.searchJobs(params);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(filters); }, [filters, loadJobs]);

  const handleFilterChange = (newFilters: JobFilterParams) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleSaveToggle = (jobId: number, saved: boolean) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSavedByCandidate: saved } : j));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Explore Jobs</h1>
        <p className="text-sm text-slate-500 mt-1">
          {loading ? 'Loading...' : `${jobs.length} ${jobs.length === 1 ? 'role' : 'roles'} available`}
        </p>
      </div>

      {/* Mobile filter toggle */}
      <div className="flex items-center gap-3 mb-4 lg:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="wellfound-btn-secondary py-2 text-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <div className={`shrink-0 w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-6">
            <JobFilterBar filters={filters} onChange={handleFilterChange} onReset={handleReset} />
          </div>
        </div>

        {/* Job Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <JobCardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No jobs match your search"
              description="Try adjusting your filters or search terms."
              actionLabel="Clear Filters"
              onAction={() => setFilters({})}
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} onSaveToggle={handleSaveToggle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
