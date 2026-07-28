import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { resumeService } from '../../services/resumeService';
import { Applicant, ApplicationStatus } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusPill } from '../../components/common/StatusPill';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { ChevronLeft, Users, FileText, ExternalLink, Mail, MapPin, Building2, Linkedin, Github, Globe } from 'lucide-react';
import { timeAgo, formatFileSize } from '../../utils/helpers';

export const ApplicantReviewPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { success, error: notify } = useNotification();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const loadApplicants = async (status?: ApplicationStatus) => {
    if (!jobId) return;
    try {
      const data = await recruiterService.getJobApplicants(Number(jobId), status);
      setApplicants(data);
      if (data.length > 0 && !selectedApplicant) {
        setSelectedApplicant(data[0]);
      } else if (data.length === 0) {
        setSelectedApplicant(null);
      }
    } catch (err) {
      notify('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants(filter === 'ALL' ? undefined : filter);
  }, [jobId, filter]);

  const handleStatusChange = async (appId: number, status: ApplicationStatus) => {
    try {
      const updated = await recruiterService.updateApplicationStatus(appId, status);
      success(`Status updated to ${status}`);
      setApplicants(prev => prev.map(a => a.applicationId === appId ? updated : a));
      if (selectedApplicant?.applicationId === appId) {
        setSelectedApplicant(updated);
      }
    } catch (err) {
      notify('Failed to update status');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner label="Loading applicants..." />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in h-[calc(100vh-64px)] flex flex-col">
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-4 transition-colors shrink-0">
        <ChevronLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Review Applicants</h1>
          <p className="text-sm text-slate-500 mt-1">Job: {applicants[0]?.jobTitle || 'Unknown Job'}</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="wellfound-input py-2 text-sm"
          >
            <option value="ALL">All Applicants</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="REJECTED">Rejected</option>
            <option value="HIRED">Hired</option>
          </select>
        </div>
      </div>

      {applicants.length === 0 && filter === 'ALL' ? (
        <EmptyState
          icon={Users}
          title="No applicants yet"
          description="You haven't received any applications for this job yet."
        />
      ) : (
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Applicant List Sidebar */}
          <div className="w-80 shrink-0 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {applicants.length} {applicants.length === 1 ? 'Applicant' : 'Applicants'}
              </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {applicants.map(app => (
                <button
                  key={app.applicationId}
                  onClick={() => setSelectedApplicant(app)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-2 ${
                    selectedApplicant?.applicationId === app.applicationId
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold truncate ${selectedApplicant?.applicationId === app.applicationId ? 'text-white' : 'text-slate-900'}`}>
                      {app.candidateName}
                    </p>
                    <div className="shrink-0 scale-90 origin-right">
                      <StatusPill status={app.status} />
                    </div>
                  </div>
                  <p className={`text-xs truncate ${selectedApplicant?.applicationId === app.applicationId ? 'text-slate-300' : 'text-slate-500'}`}>
                    Applied {timeAgo(app.appliedAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Applicant Detail View */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-y-auto">
            {selectedApplicant ? (
              <div className="p-8">
                {/* Header & Status Actions */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b border-slate-100">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{selectedApplicant.candidateName}</h2>
                    <p className="text-slate-600 font-medium mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${selectedApplicant.candidateEmail}`} className="hover:text-indigo-600 transition-colors">
                        {selectedApplicant.candidateEmail}
                      </a>
                    </p>
                    {selectedApplicant.profile.headline && (
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block">
                        {selectedApplicant.profile.headline}
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full lg:w-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {(['SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED'] as ApplicationStatus[]).map(status => (
                        <button
                          key={status}
                          disabled={selectedApplicant.status === status}
                          onClick={() => handleStatusChange(selectedApplicant.applicationId, status)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            selectedApplicant.status === status
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Details */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    {selectedApplicant.profile.about && (
                      <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">About</h3>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {selectedApplicant.profile.about}
                        </p>
                      </section>
                    )}

                    {/* Experience */}
                    {selectedApplicant.profile.experiences && selectedApplicant.profile.experiences.length > 0 && (
                      <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Experience</h3>
                        <div className="space-y-4">
                          {selectedApplicant.profile.experiences.map((exp, idx) => (
                            <div key={idx} className="relative pl-4 border-l-2 border-slate-200">
                              <div className="absolute w-2.5 h-2.5 bg-slate-200 rounded-full -left-[6px] top-1.5" />
                              <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                              <p className="text-sm text-slate-600">{exp.companyName}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                              </p>
                              {exp.description && (
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Education */}
                    {selectedApplicant.profile.educations && selectedApplicant.profile.educations.length > 0 && (
                      <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Education</h3>
                        <div className="space-y-4">
                          {selectedApplicant.profile.educations.map((edu, idx) => (
                            <div key={idx} className="relative pl-4 border-l-2 border-slate-200">
                              <div className="absolute w-2.5 h-2.5 bg-slate-200 rounded-full -left-[6px] top-1.5" />
                              <p className="text-sm font-bold text-slate-900">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                              <p className="text-sm text-slate-600">{edu.institution}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{edu.startYear} — {edu.endYear || 'Present'}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Right Column: Meta info & Resume */}
                  <div className="space-y-6">
                    <section className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Info</h3>
                      <div className="space-y-3 text-sm">
                        {selectedApplicant.profile.location && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {selectedApplicant.profile.location}
                          </div>
                        )}
                        {selectedApplicant.profile.currentCompany && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {selectedApplicant.profile.currentCompany}
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Links</h3>
                      <div className="space-y-3 text-sm">
                        {selectedApplicant.profile.linkedinUrl && (
                          <a href={selectedApplicant.profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                            <Linkedin className="w-4 h-4" /> LinkedIn
                          </a>
                        )}
                        {selectedApplicant.profile.githubUrl && (
                          <a href={selectedApplicant.profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                            <Github className="w-4 h-4" /> GitHub
                          </a>
                        )}
                        {selectedApplicant.profile.portfolioUrl && (
                          <a href={selectedApplicant.profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                            <Globe className="w-4 h-4" /> Portfolio
                          </a>
                        )}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Submitted Resume</h3>
                      <a
                        href={resumeService.getPreviewUrl(selectedApplicant.resume.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 mr-3">
                          <FileText className="w-5 h-5 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{selectedApplicant.resume.fileName}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(selectedApplicant.resume.fileSize)}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-2" />
                      </a>
                    </section>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                Select an applicant to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
