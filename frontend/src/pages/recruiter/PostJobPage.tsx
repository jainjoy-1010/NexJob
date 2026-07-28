import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { jobService } from '../../services/jobService';
import { InputField, TextAreaField, SelectField } from '../../components/common/FormFields';
import { useNotification } from '../../context/NotificationContext';
import { ChevronLeft, Loader2 } from 'lucide-react';

const jobSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD']),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  salaryType: z.enum(['LPA', 'MONTHLY']),
});
type JobFormData = z.infer<typeof jobSchema>;

export const PostJobPage: React.FC = () => {
  const { success, error: notify } = useNotification();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const isEditMode = !!jobId;
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      workMode: 'REMOTE',
      experienceLevel: 'MID',
      salaryType: 'LPA',
    },
  });

  React.useEffect(() => {
    if (isEditMode && jobId) {
      const fetchJob = async () => {
        try {
          const job = await jobService.getJobById(Number(jobId));
          reset({
            title: job.title,
            description: job.description,
            location: job.location,
            workMode: job.workMode,
            experienceLevel: job.experienceLevel,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryType: job.salaryType,
          });
        } catch (err) {
          notify('Failed to load job details');
          navigate('/recruiter/jobs');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [jobId, isEditMode, reset, navigate, notify]);

  const onSubmit = async (data: JobFormData) => {
    try {
      setSubmitting(true);
      if (isEditMode && jobId) {
        await recruiterService.updateJob(Number(jobId), data);
        success('Job updated successfully!');
      } else {
        await recruiterService.createJob(data);
        success('Job posted successfully!');
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      notify(`Failed to ${isEditMode ? 'update' : 'post'} job`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">{isEditMode ? 'Edit Job Posting' : 'Post a New Job'}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isEditMode ? 'Update the details below to modify your job posting.' : 'Fill out the details below to publish a new role.'}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField
            label="Job Title"
            placeholder="e.g. Senior Frontend Engineer"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectField
              label="Work Mode"
              options={[
                { label: 'Remote', value: 'REMOTE' },
                { label: 'Hybrid', value: 'HYBRID' },
                { label: 'On-site', value: 'ONSITE' },
              ]}
              error={errors.workMode?.message}
              {...register('workMode')}
            />
            <SelectField
              label="Experience Level"
              options={[
                { label: 'Entry Level', value: 'ENTRY' },
                { label: 'Mid Level', value: 'MID' },
                { label: 'Senior Level', value: 'SENIOR' },
                { label: 'Lead / Manager', value: 'LEAD' },
              ]}
              error={errors.experienceLevel?.message}
              {...register('experienceLevel')}
            />
          </div>

          <InputField
            label="Location"
            placeholder="e.g. Bangalore, India (or Worldwide for Remote)"
            error={errors.location?.message}
            {...register('location')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <InputField
              label="Min Salary"
              type="number"
              placeholder="e.g. 15"
              error={errors.salaryMin?.message}
              {...register('salaryMin')}
            />
            <InputField
              label="Max Salary"
              type="number"
              placeholder="e.g. 30"
              error={errors.salaryMax?.message}
              {...register('salaryMax')}
            />
            <SelectField
              label="Salary Type"
              options={[
                { label: 'LPA (Lakhs per Annum)', value: 'LPA' },
                { label: 'Monthly', value: 'MONTHLY' },
              ]}
              error={errors.salaryType?.message}
              {...register('salaryType')}
            />
          </div>

          <TextAreaField
            label="Job Description"
            rows={10}
            placeholder="Describe the role, responsibilities, and requirements..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/recruiter/jobs" className="wellfound-btn-secondary py-2">Cancel</Link>
            <button type="submit" disabled={submitting} className="wellfound-btn-primary py-2 px-6">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? 'Updating...' : 'Publishing...'}</>
              ) : (
                isEditMode ? 'Update Job' : 'Publish Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
