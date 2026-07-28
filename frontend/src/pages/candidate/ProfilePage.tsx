import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { candidateService } from '../../services/candidateService';
import { ResumeManager } from '../../components/candidate/ResumeManager';
import { ProgressBar } from '../../components/common/ProgressBar';
import { InputField, TextAreaField } from '../../components/common/FormFields';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import { CandidateProfile, Experience, Education } from '../../types';
import {
  User, Briefcase, GraduationCap, Plus, Trash2, Edit3, Loader2,
  Github, Linkedin, Globe, MapPin, Building2
} from 'lucide-react';
import { getErrorMessage, formatDate } from '../../utils/helpers';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  headline: z.string().optional(),
  about: z.string().optional(),
  skills: z.string().optional(),
  location: z.string().optional(),
  currentCompany: z.string().optional(),
  githubUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const expSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  title: z.string().min(1, 'Job title is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
});
type ExpFormData = z.infer<typeof expSchema>;

const eduSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  startYear: z.coerce.number().optional(),
  endYear: z.coerce.number().optional(),
});
type EduFormData = z.infer<typeof eduSchema>;

export const ProfilePage: React.FC = () => {
  const { success, error: notify } = useNotification();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'education' | 'resumes'>('profile');

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [deleteExpId, setDeleteExpId] = useState<number | null>(null);
  const [deleteEduId, setDeleteEduId] = useState<number | null>(null);

  const profileForm = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });
  const expForm = useForm<ExpFormData>({ resolver: zodResolver(expSchema) });
  const eduForm = useForm<EduFormData>({ resolver: zodResolver(eduSchema) });

  const fetchProfile = async () => {
    try {
      const data = await candidateService.getProfile();
      setProfile(data);
      profileForm.reset({
        fullName: data.fullName || '',
        headline: data.headline || '',
        about: data.about || '',
        skills: data.skills || '',
        location: data.location || '',
        currentCompany: data.currentCompany || '',
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        portfolioUrl: data.portfolioUrl || '',
      });
    } catch (err) {
      notify(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onSaveProfile = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      const updated = await candidateService.updateProfile(data);
      setProfile(updated);
      success('Profile updated successfully!');
    } catch (err) {
      notify(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onAddExperience = async (data: ExpFormData) => {
    try {
      const updated = await candidateService.addExperience(data as Experience);
      setProfile(updated);
      expForm.reset();
      setExpModalOpen(false);
      success('Experience added!');
    } catch (err) {
      notify(getErrorMessage(err));
    }
  };

  const onDeleteExperience = async () => {
    if (!deleteExpId) return;
    try {
      const updated = await candidateService.deleteExperience(deleteExpId);
      setProfile(updated);
      success('Experience removed.');
    } catch (err) {
      notify(getErrorMessage(err));
    } finally {
      setDeleteExpId(null);
    }
  };

  const onAddEducation = async (data: EduFormData) => {
    try {
      const updated = await candidateService.addEducation(data as Education);
      setProfile(updated);
      eduForm.reset();
      setEduModalOpen(false);
      success('Education added!');
    } catch (err) {
      notify(getErrorMessage(err));
    }
  };

  const onDeleteEducation = async () => {
    if (!deleteEduId) return;
    try {
      const updated = await candidateService.deleteEducation(deleteEduId);
      setProfile(updated);
      success('Education removed.');
    } catch (err) {
      notify(getErrorMessage(err));
    } finally {
      setDeleteEduId(null);
    }
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'experience', label: 'Experience', icon: Briefcase },
    { key: 'education', label: 'Education', icon: GraduationCap },
    { key: 'resumes', label: 'Resumes', icon: Edit3 },
  ];

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="skeleton h-8 w-48 rounded mb-4" />
      <div className="skeleton h-4 w-96 rounded mb-8" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your professional profile, resumes, and career history.</p>
      </div>

      {/* Completion Progress */}
      {profile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <ProgressBar percentage={profile.completionPercentage} />
          <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-slate-500">
            {[
              { label: 'Basic Info', done: !!profile.fullName },
              { label: 'About', done: !!profile.about },
              { label: 'Skills', done: !!profile.skills },
              { label: 'Location', done: !!profile.location },
              { label: 'Primary Resume', done: profile.hasPrimaryResume },
            ].map(item => (
              <span key={item.label} className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
                item.done ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                {item.done ? '✓' : '○'} {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* — PROFILE TAB — */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Full Name" error={profileForm.formState.errors.fullName?.message} {...profileForm.register('fullName')} placeholder="John Doe" />
              <InputField label="Headline" error={profileForm.formState.errors.headline?.message} {...profileForm.register('headline')} placeholder="e.g. Full Stack Developer | React & Java" />
            </div>

            <TextAreaField label="About" rows={4} {...profileForm.register('about')} placeholder="A short bio about yourself, your experience, and goals..." />

            <InputField label="Skills (comma-separated)" {...profileForm.register('skills')} placeholder="e.g. React, TypeScript, Spring Boot, SQL" hint="Separate skills with commas." />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <InputField label="Location" {...profileForm.register('location')} placeholder="e.g. Bangalore, India" />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-9" />
              </div>
              <div className="relative">
                <InputField label="Current Company" {...profileForm.register('currentCompany')} placeholder="e.g. Infosys" />
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-9" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <InputField label="GitHub URL" error={profileForm.formState.errors.githubUrl?.message} {...profileForm.register('githubUrl')} placeholder="https://github.com/..." />
                <Github className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-9" />
              </div>
              <div className="relative">
                <InputField label="LinkedIn URL" error={profileForm.formState.errors.linkedinUrl?.message} {...profileForm.register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
                <Linkedin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-9" />
              </div>
              <div className="relative">
                <InputField label="Portfolio / Website" error={profileForm.formState.errors.portfolioUrl?.message} {...profileForm.register('portfolioUrl')} placeholder="https://yoursite.com" />
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-9" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={saving} className="wellfound-btn-primary py-2.5 text-sm">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* — EXPERIENCE TAB — */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { expForm.reset(); setExpModalOpen(true); }} className="wellfound-btn-primary py-2 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </div>

          {(profile?.experiences || []).length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl text-slate-500">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No work experience added</p>
            </div>
          ) : (
            profile?.experiences.map((exp) => (
              <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                  <p className="text-sm text-slate-600">{exp.companyName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  {exp.description && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>}
                </div>
                <button
                  onClick={() => setDeleteExpId(exp.id!)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* — EDUCATION TAB — */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { eduForm.reset(); setEduModalOpen(true); }} className="wellfound-btn-primary py-2 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </div>

          {(profile?.educations || []).length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl text-slate-500">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No education added</p>
            </div>
          ) : (
            profile?.educations.map((edu) => (
              <div key={edu.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{edu.degree}{edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}</p>
                  <p className="text-sm text-slate-600">{edu.institution}</p>
                  {(edu.startYear || edu.endYear) && (
                    <p className="text-xs text-slate-400 mt-0.5">{edu.startYear} — {edu.endYear || 'Present'}</p>
                  )}
                </div>
                <button onClick={() => setDeleteEduId(edu.id!)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* — RESUMES TAB — */}
      {activeTab === 'resumes' && (
        <ResumeManager onResumesUpdated={fetchProfile} />
      )}

      {/* Add Experience Modal */}
      <Modal isOpen={expModalOpen} onClose={() => setExpModalOpen(false)} title="Add Work Experience">
        <form onSubmit={expForm.handleSubmit(onAddExperience)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Job Title" error={expForm.formState.errors.title?.message} {...expForm.register('title')} placeholder="Software Engineer" />
            <InputField label="Company" error={expForm.formState.errors.companyName?.message} {...expForm.register('companyName')} placeholder="Google" />
          </div>
          <InputField label="Location (optional)" {...expForm.register('location')} placeholder="San Francisco, CA" />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Start Date" type="date" error={expForm.formState.errors.startDate?.message} {...expForm.register('startDate')} />
            <InputField label="End Date" type="date" {...expForm.register('endDate')} />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" {...expForm.register('isCurrent')} className="rounded" />
            Currently working here
          </label>
          <TextAreaField label="Description (optional)" rows={3} {...expForm.register('description')} placeholder="Key responsibilities and achievements..." />
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setExpModalOpen(false)} className="wellfound-btn-secondary py-2 text-xs">Cancel</button>
            <button type="submit" className="wellfound-btn-primary py-2 text-xs">Add Experience</button>
          </div>
        </form>
      </Modal>

      {/* Add Education Modal */}
      <Modal isOpen={eduModalOpen} onClose={() => setEduModalOpen(false)} title="Add Education">
        <form onSubmit={eduForm.handleSubmit(onAddEducation)} className="space-y-4">
          <InputField label="Institution" error={eduForm.formState.errors.institution?.message} {...eduForm.register('institution')} placeholder="MIT, IIT Bombay..." />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Degree" error={eduForm.formState.errors.degree?.message} {...eduForm.register('degree')} placeholder="B.Tech, B.Sc..." />
            <InputField label="Field of Study" {...eduForm.register('fieldOfStudy')} placeholder="Computer Science" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Start Year" type="number" {...eduForm.register('startYear')} placeholder="2020" />
            <InputField label="End Year" type="number" {...eduForm.register('endYear')} placeholder="2024" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setEduModalOpen(false)} className="wellfound-btn-secondary py-2 text-xs">Cancel</button>
            <button type="submit" className="wellfound-btn-primary py-2 text-xs">Add Education</button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteExpId}
        title="Remove Experience"
        message="Are you sure you want to remove this work experience?"
        confirmLabel="Remove"
        onConfirm={onDeleteExperience}
        onCancel={() => setDeleteExpId(null)}
      />
      <ConfirmDialog
        isOpen={!!deleteEduId}
        title="Remove Education"
        message="Are you sure you want to remove this education entry?"
        confirmLabel="Remove"
        onConfirm={onDeleteEducation}
        onCancel={() => setDeleteEduId(null)}
      />
    </div>
  );
};
