import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types';
import { Badge } from '../common/Badge';
import { MapPin, Building2, Bookmark, CheckCircle2 } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';

interface JobCardProps {
  job: Job;
  onSaveToggle?: (jobId: number, isSaved: boolean) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSaveToggle }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(!!job.isSavedByCandidate);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'CANDIDATE') return;

    try {
      setIsSaving(true);
      const newStatus = await jobService.toggleSaveJob(job.id);
      setIsSaved(newStatus);
      if (onSaveToggle) onSaveToggle(job.id, newStatus);
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const typeLabel = job.salaryType === 'MONTHLY' ? '/mo' : 'LPA';
    if (job.salaryMin && job.salaryMax) {
      return `₹${job.salaryMin} - ₹${job.salaryMax} ${typeLabel}`;
    }
    return `₹${job.salaryMin || job.salaryMax} ${typeLabel}`;
  };

  return (
    <div className="wellfound-card flex flex-col justify-between group">
      <div>
        {/* Top Header: Company & Action */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden text-lg">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
              ) : (
                job.company?.name ? job.company.name.charAt(0).toUpperCase() : 'C'
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {job.company?.name || 'Company'}
              </h4>
              <p className="text-xs text-slate-500">{job.company?.industry || 'Tech / Software'}</p>
            </div>
          </div>

          {user?.role === 'CANDIDATE' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-2 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
              title={isSaved ? 'Unsave Job' : 'Save Job'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>

        {/* Job Title */}
        <Link to={`/jobs/${job.id}`}>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
            {job.title}
          </h3>
        </Link>

        {/* Badges: Location, WorkMode, Exp, Salary */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="slate">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            {job.location}
          </Badge>

          <Badge variant={job.workMode === 'REMOTE' ? 'emerald' : job.workMode === 'HYBRID' ? 'sky' : 'slate'}>
            {job.workMode}
          </Badge>

          <Badge variant="indigo">{job.experienceLevel} Level</Badge>

          {formatSalary() && <Badge variant="amber">{formatSalary()}</Badge>}
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Posted by <span className="font-medium text-slate-700">{job.recruiterName || 'HR'}</span> • {new Date(job.createdAt).toLocaleDateString()}
        </span>
        
        {user?.role !== 'RECRUITER' && (
          job.isAppliedByCandidate ? (
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Applied
            </span>
          ) : (
            <Link
              to={`/jobs/${job.id}`}
              className="font-semibold text-slate-900 hover:text-emerald-600 flex items-center gap-1 transition-colors"
            >
              Apply Now &rarr;
            </Link>
          )
        )}
      </div>
    </div>
  );
};
