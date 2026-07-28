import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { useAuth } from '../../context/AuthContext';
import { RecruiterDashboardStats } from '../../types';
import { StatusPill } from '../../components/common/StatusPill';
import { StatCardSkeleton } from '../../components/common/Skeletons';
import { EmptyState } from '../../components/common/EmptyState';
import { getErrorMessage, timeAgo, getInitial } from '../../utils/helpers';
import { useNotification } from '../../context/NotificationContext';
import {
  Users, Briefcase, Plus, ChevronRight, FileText,
  CheckCircle, XCircle, ClipboardList, LayoutList
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const { error: notify } = useNotification();
  const navigate = useNavigate();
  const [stats, setStats] = useState<RecruiterDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruiterService.getDashboardStats()
      .then(setStats)
      .catch(err => notify(getErrorMessage(err, 'Failed to load dashboard')))
      .finally(() => setLoading(false));
  }, []);

  const dashboardCards = [
    {
      label: 'Active Jobs',
      count: stats?.activeJobs ?? 0,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      hoverShadow: 'hover:shadow-emerald-100',
      to: '/recruiter/jobs?filter=active',
    },
    {
      label: 'Inactive Jobs',
      count: stats?.closedJobs ?? 0,
      icon: XCircle,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      hoverBorder: 'hover:border-rose-300',
      hoverShadow: 'hover:shadow-rose-100',
      to: '/recruiter/jobs?filter=inactive',
    },
    {
      label: 'Applicants',
      count: stats?.totalApplicants ?? 0,
      icon: Users,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      hoverBorder: 'hover:border-violet-300',
      hoverShadow: 'hover:shadow-violet-100',
      to: '/recruiter/jobs?filter=all',
    },
    {
      label: 'Posted Jobs',
      count: (stats?.activeJobs ?? 0) + (stats?.closedJobs ?? 0),
      icon: LayoutList,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      hoverBorder: 'hover:border-sky-300',
      hoverShadow: 'hover:shadow-sky-100',
      to: '/recruiter/jobs',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here is the overview of your hiring pipeline.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="wellfound-btn-primary py-2 text-sm shrink-0">
          <Plus className="w-4 h-4" /> Post a Job
        </Link>
      </div>

      {/* Dashboard Navigation Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
        ) : (
          dashboardCards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.to)}
              className={`stat-card text-left cursor-pointer transition-all duration-200 border-2 border-transparent ${card.hoverBorder} ${card.hoverShadow} hover:shadow-lg group`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                  <card.icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-extrabold text-slate-900">{card.count}</p>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applicants */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
            <Link to="/recruiter/jobs" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
              Manage jobs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
          ) : !stats?.recentApplicants?.length ? (
            <EmptyState
              icon={Users}
              title="No recent applicants"
              description="When candidates apply to your jobs, they'll show up here."
              actionLabel="Post a Job"
              actionTo="/recruiter/jobs/new"
            />
          ) : (
            <div className="space-y-3">
              {stats.recentApplicants.map((app) => (
                <div key={app.applicationId} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                      {getInitial(app.candidateName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {app.candidateName}
                      </p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        Applied for <span className="font-medium text-slate-700">{app.jobTitle}</span> • {timeAgo(app.appliedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={app.status} />
                    <Link
                      to={`/recruiter/jobs/${app.jobId}/applicants`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Review Applicant"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
