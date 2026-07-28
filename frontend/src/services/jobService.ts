import { api } from './api';
import { Job, WorkMode, ExperienceLevel, SalaryType } from '../types';

export interface JobFilterParams {
  query?: string;
  location?: string;
  workMode?: WorkMode;
  experienceLevel?: ExperienceLevel;
  salaryType?: SalaryType;
  minSalary?: number;
}

export const jobService = {
  async searchJobs(params?: JobFilterParams): Promise<Job[]> {
    const res = await api.get<Job[]>('/jobs', { params });
    return res.data;
  },

  async getJobById(id: number): Promise<Job> {
    const res = await api.get<Job>(`/jobs/${id}`);
    return res.data;
  },

  async toggleSaveJob(id: number): Promise<boolean> {
    const res = await api.post<boolean>(`/jobs/${id}/save`);
    return res.data;
  },

  async getSavedJobs(): Promise<Job[]> {
    const res = await api.get<Job[]>('/jobs/saved');
    return res.data;
  },
};
