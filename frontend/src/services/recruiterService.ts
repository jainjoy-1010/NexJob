import { api } from './api';
import { Job, Applicant, RecruiterDashboardStats, ApplicationStatus } from '../types';

export const recruiterService = {
  async getDashboardStats(): Promise<RecruiterDashboardStats> {
    const res = await api.get<RecruiterDashboardStats>('/recruiter/dashboard/stats');
    return res.data;
  },

  async getMyJobs(): Promise<Job[]> {
    const res = await api.get<Job[]>('/recruiter/jobs');
    return res.data;
  },

  async createJob(jobData: any): Promise<Job> {
    const res = await api.post<Job>('/recruiter/jobs', jobData);
    return res.data;
  },

  async updateJob(id: number, jobData: any): Promise<Job> {
    const res = await api.put<Job>(`/recruiter/jobs/${id}`, jobData);
    return res.data;
  },

  async toggleJobStatus(id: number): Promise<Job> {
    const res = await api.patch<Job>(`/recruiter/jobs/${id}/status`);
    return res.data;
  },

  async deleteJob(id: number): Promise<void> {
    await api.delete(`/recruiter/jobs/${id}`);
  },

  async getJobApplicants(jobId: number, status?: ApplicationStatus): Promise<Applicant[]> {
    const res = await api.get<Applicant[]>(`/recruiter/jobs/${jobId}/applicants`, {
      params: status ? { status } : {},
    });
    return res.data;
  },

  async updateApplicationStatus(appId: number, status: ApplicationStatus): Promise<Applicant> {
    const res = await api.patch<Applicant>(`/recruiter/applications/${appId}/status`, { status });
    return res.data;
  },
};
