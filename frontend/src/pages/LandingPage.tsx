import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { jobService, JobFilterParams } from '../services/jobService';
import { JobCard } from '../components/job/JobCard';
import { JobFilterBar } from '../components/job/JobFilterBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Sparkles, TrendingUp } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilterParams>({});

  const fetchJobs = async (filterParams?: JobFilterParams) => {
    try {
      setLoading(true);
      const data = await jobService.searchJobs(filterParams);
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(filters);
  }, [filters]);

  const handleReset = () => {
    setFilters({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Finest Startup Talent Network
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Find your next high-growth startup role.
        </h1>
        <p className="text-base sm:text-lg text-slate-600">
          Apply directly to top tech companies & fast-growing engineering teams with 1-click primary resume submission.
        </p>
      </div>

      {/* Search & Filter Component */}
      <JobFilterBar filters={filters} onChange={setFilters} onReset={handleReset} />

      {/* Jobs List Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Featured Opportunities ({jobs.length})
        </h2>
      </div>

      {/* Job Grid */}
      {loading ? (
        <LoadingSpinner label="Fetching active job listings..." />
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <p className="text-base font-semibold text-slate-700">No matching jobs found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your keyword or filter options.</p>
          <button onClick={handleReset} className="wellfound-btn-secondary py-2 text-xs mt-4">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
