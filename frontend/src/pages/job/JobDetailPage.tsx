import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { JobCard } from '../../components/job/JobCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Job } from '../../types';
import { formatSalary, getErrorMessage } from '../../utils/helpers';
import {
  MapPin, Building2, Bookmark, Loader2, CheckCircle2,
  ExternalLink, Users, ChevronLeft, Calendar
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error: notify } = useNotification();

  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [jobData, allJobs] = await Promise.all([
          jobService.getJobById(Number(id)),
          jobService.searchJobs(),
        ]);
        setJob(jobData);
        setApplied(!!jobData.isAppliedByCandidate);
        setIsSaved(!!jobData.isSavedByCandidate);
        setRelatedJobs(allJobs.filter(j => j.id !== jobData.id && j.company?.id === jobData.company?.id).slice(0, 3));
      } catch (err) {
        notify(getErrorMessage(err, 'Failed to load job details.'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleApply = async () => {
    if (!user) { notify('Please log in to apply.'); return; }
    if (user.role !== 'CANDIDATE') { notify('Only candidates can apply to jobs.'); return; }
    try {
      setApplying(true);
      await applicationService.applyToJob(Number(id));
      setApplied(true);
      success('Application submitted successfully! 🎉');
    } catch (err) {
      notify(getErrorMessage(err, 'Failed to submit application.'));
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user || user.role !== 'CANDIDATE') return;
    try {
      setSaving(true);
      const newStatus = await jobService.toggleSaveJob(Number(id));
      setIsSaved(newStatus);
    } catch (err) {
      notify(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner label="Loading job details..." />
    </div>
  );

  if (!job) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-slate-700">Job not found</h2>
      <Link to="/" className="wellfound-btn-secondary py-2 text-xs mt-4 inline-flex">Back to Jobs</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-700 shrink-0 overflow-hidden border border-slate-200">
                {job.company?.logo ? (
                  <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                ) : (
                  job.company?.name?.charAt(0) || 'C'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{job.title}</h1>
                <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {job.company?.name}
                  {job.company?.website && (
                    <a href={job.company.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge variant="slate"><MapPin className="w-3 h-3 mr-1" />{job.location}</Badge>
              <Badge variant={job.workMode === 'REMOTE' ? 'emerald' : job.workMode === 'HYBRID' ? 'sky' : 'slate'}>{job.workMode}</Badge>
              <Badge variant="indigo">{job.experienceLevel} Level</Badge>
              {(job.salaryMin || job.salaryMax) && (
                <Badge variant="amber">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</Badge>
              )}
              <Badge variant="slate"><Users className="w-3 h-3 mr-1" />{job.applicantCount} applicants</Badge>
              <Badge variant="slate"><Calendar className="w-3 h-3 mr-1" />Posted {new Date(job.createdAt).toLocaleDateString()}</Badge>
            </div>

            {/* Action Buttons */}
            {user?.role === 'CANDIDATE' && (
              <div className="flex gap-3">
                {applied ? (
                  <div className="wellfound-btn-primary bg-emerald-600 hover:bg-emerald-600 cursor-default py-2.5">
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </div>
                ) : (
                  <button onClick={handleApply} disabled={applying || !job.isActive} className="wellfound-btn-primary py-2.5 px-8">
                    {applying ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</> : '⚡ Quick Apply'}
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`wellfound-btn-secondary py-2.5 ${isSaved ? 'bg-slate-900 text-white' : ''}`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            )}

            {!user && (
              <div className="flex gap-3">
                <Link to="/login" className="wellfound-btn-primary py-2.5 px-8">Login to Apply</Link>
              </div>
            )}

            {!job.isActive && (
              <div className="mt-3 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                This job listing is currently closed.
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Job Description</h2>
            <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Card */}
          {job.company && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">About the Company</h3>
              <p className="text-sm font-semibold text-slate-800">{job.company.name}</p>
              {job.company.industry && <p className="text-xs text-slate-500 mt-0.5">{job.company.industry}</p>}
              {job.company.companySize && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {job.company.companySize} employees
                </p>
              )}
              {job.company.location && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.company.location}
                </p>
              )}
              {job.company.description && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-4">{job.company.description}</p>
              )}
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-slate-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">More from {job.company?.name}</h3>
              <div className="space-y-3">
                {relatedJobs.map(rj => (
                  <JobCard key={rj.id} job={rj} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
