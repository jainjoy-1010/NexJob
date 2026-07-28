import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import { StatusPill } from '../../components/common/StatusPill';
import { EmptyState } from '../../components/common/EmptyState';
import { Application } from '../../types';
import { Briefcase, FileText, ExternalLink } from 'lucide-react';
import { formatDate, timeAgo } from '../../utils/helpers';
import { resumeService } from '../../services/resumeService';

export const AppliedJobsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationService.getMyApplications()
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Track the status of your submitted job applications.</p>
      </div>

      {/* Stats */}
      {!loading && applications.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <StatusPill status={status as any} />
              <span className="text-xs font-semibold text-slate-700">{count}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="You haven't applied to any jobs yet. Browse open roles and apply with one click."
          actionLabel="Browse Jobs"
          actionTo="/"
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Company Logo */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-lg shrink-0">
                {app.job?.company?.name?.charAt(0) || 'C'}
              </div>

              {/* Job Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{app.job?.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{app.job?.company?.name} · {app.job?.location}</p>
                  </div>
                  <StatusPill status={app.status} />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>Applied {timeAgo(app.appliedAt)} ({formatDate(app.appliedAt)})</span>
                  {app.resume && (
                    <a
                      href={resumeService.getPreviewUrl(app.resume.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {app.resume.fileName}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
