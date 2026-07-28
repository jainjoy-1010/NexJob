import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { resumeService } from '../../services/resumeService';
import { candidateService } from '../../services/candidateService';
import { JobCard } from '../../components/job/JobCard';
import { StatusPill } from '../../components/common/StatusPill';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCardSkeleton, JobCardSkeleton } from '../../components/common/Skeletons';
import { useAuth } from '../../context/AuthContext';
import { CandidateProfile, Application, Job, Resume } from '../../types';
import {
  Briefcase, Bookmark, FileText, User, ChevronRight, TrendingUp, ArrowRight
} from 'lucide-react';
import { timeAgo } from '../../utils/helpers';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prof, apps, saved, res, jobs] = await Promise.all([
          candidateService.getProfile(),
          applicationService.getMyApplications(),
          jobService.getSavedJobs(),
          resumeService.getResumes(),
          jobService.searchJobs(),
        ]);
        setProfile(prof);
        setApplications(apps);
        setSavedJobs(saved);
        setResumes(res);
        setRecommendedJobs(jobs.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const recentApplications = applications.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Good morning, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening with your job search.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Applications</p>
                <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-sky-600" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{applications.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total submitted</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saved Jobs</p>
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{savedJobs.length}</p>
              <p className="text-xs text-slate-400 mt-1">Bookmarked roles</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resumes</p>
                <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 text-violet-600" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{resumes.length}/3</p>
              <p className="text-xs text-slate-400 mt-1">{resumes.find(r => r.isPrimary) ? 'Primary set' : 'No primary set'}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile</p>
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{profile?.completionPercentage ?? 0}%</p>
              <p className="text-xs text-slate-400 mt-1">Profile completion</p>
            </div>
          </>
        )}
      </div>

      {/* Profile Completion Banner */}
      {profile && profile.completionPercentage < 100 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <ProgressBar percentage={profile.completionPercentage} />
            <p className="text-xs text-slate-500 mt-2">
              Complete your profile to appear in recruiter searches and apply faster.
            </p>
          </div>
          <Link to="/candidate/profile" className="wellfound-btn-primary shrink-0 py-2 text-xs">
            Complete Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
          ) : recentApplications.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No applications yet"
              description="Start applying to jobs and track your progress here."
              actionLabel="Browse Jobs"
              actionTo="/"
            />
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                      {app.job?.company?.name?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{app.job?.title}</p>
                      <p className="text-xs text-slate-500 truncate">{app.job?.company?.name} • {timeAgo(app.appliedAt)}</p>
                    </div>
                  </div>
                  <StatusPill status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Explore Jobs
            </h2>
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
              All jobs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <JobCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendedJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
