import { api } from './api';
import { Application } from '../types';

export const applicationService = {
  async applyToJob(jobId: number): Promise<Application> {
    const res = await api.post<Application>(`/applications/jobs/${jobId}`);
    return res.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const res = await api.get<Application[]>('/applications/my-applications');
    return res.data;
  },
};
