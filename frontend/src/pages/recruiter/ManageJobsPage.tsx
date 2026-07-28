import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { Job } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import {
  Briefcase, Plus, Users, Edit2, Trash2,
  CheckCircle, XCircle, LayoutList
} from 'lucide-react';

type FilterType = 'all' | 'active' | 'inactive';

const FILTER_CONFIG: Record<FilterType, { label: string; icon: React.ElementType; color: string }> = {
  all:      { label: 'All Jobs',      icon: LayoutList,  color: 'text-sky-600 bg-sky-50 border-sky-200' },
  active:   { label: 'Active Jobs',   icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  inactive: { label: 'Inactive Jobs', icon: XCircle,     color: 'text-rose-600 bg-rose-50 border-rose-200' },
};

export const ManageJobsPage: React.FC = () => {
  const { success, error: notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);

  const currentFilter = (searchParams.get('filter') as FilterType) || 'all';

  const loadJobs = async () => {
    try {
      const data = await recruiterService.getMyJobs();
      setJobs(data);
    } catch (err) {
      notify('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const filteredJobs = useMemo(() => {
    switch (currentFilter) {
      case 'active':   return jobs.filter(j => j.isActive);
      case 'inactive': return jobs.filter(j => !j.isActive);
      default:         return jobs;
    }
  }, [jobs, currentFilter]);

  const setFilter = (filter: FilterType) => {
    if (filter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter });
    }
  };

  const handleToggleStatus = async (id: number) => {
    // Optimistic update for instant feedback
    setJobs(prev => prev.map(j => j.id === id ? { ...j, isActive: !j.isActive } : j));
    try {
      await recruiterService.toggleJobStatus(id);
      success('Job status updated');
    } catch (err) {
      // Revert on failure
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isActive: !j.isActive } : j));
      notify('Failed to update job status');
    }
  };

  const handleDelete = async () => {
    if (!deleteJobId) return;
    try {
      await recruiterService.deleteJob(deleteJobId);
      success('Job deleted successfully');
      loadJobs();
    } catch (err) {
      notify('Failed to delete job');
    } finally {
      setDeleteJobId(null);
    }
  };

  const counts = useMemo(() => ({
    all: jobs.length,
    active: jobs.filter(j => j.isActive).length,
    inactive: jobs.filter(j => !j.isActive).length,
  }), [jobs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">Create, edit, and track your job postings.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="wellfound-btn-primary py-2 text-sm shrink-0">
          <Plus className="w-4 h-4" /> Post a Job
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(Object.keys(FILTER_CONFIG) as FilterType[]).map((key) => {
          const config = FILTER_CONFIG[key];
          const isActive = currentFilter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                isActive
                  ? `${config.color} shadow-sm`
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <config.icon className="w-3.5 h-3.5" />
              {config.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive ? 'bg-white/60 text-inherit' : 'bg-slate-100 text-slate-400'
              }`}>
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={currentFilter === 'all' ? 'No jobs posted yet' : `No ${currentFilter} jobs`}
          description={
            currentFilter === 'all'
              ? 'Create your first job posting to start attracting top talent.'
              : `You don't have any ${currentFilter} jobs right now.`
          }
          actionLabel={currentFilter === 'all' ? 'Post a Job' : undefined}
          actionTo={currentFilter === 'all' ? '/recruiter/jobs/new' : undefined}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applicants</th>
                <th className="px-6 py-4">Posted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.location} • {job.workMode}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                      job.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/recruiter/jobs/${job.id}/applicants`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                      <Users className="w-3.5 h-3.5" />
                      {job.applicantCount}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/recruiter/jobs/${job.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Edit Job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(job.id)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          job.isActive
                            ? 'bg-emerald-500 focus:ring-emerald-500'
                            : 'bg-rose-500 focus:ring-rose-500'
                        }`}
                        title={job.isActive ? 'Deactivate Job' : 'Activate Job'}
                      >
                        <span
                          className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                            job.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => setDeleteJobId(job.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteJobId}
        title="Delete Job"
        message="Are you sure you want to delete this job posting? This action cannot be undone and will remove all associated applications."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteJobId(null)}
      />
    </div>
  );
};
