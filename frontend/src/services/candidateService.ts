import { api } from './api';
import { CandidateProfile, Experience, Education } from '../types';

export const candidateService = {
  async getProfile(): Promise<CandidateProfile> {
    const res = await api.get<CandidateProfile>('/candidate/profile');
    return res.data;
  },

  async updateProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await api.put<CandidateProfile>('/candidate/profile', data);
    return res.data;
  },

  async addExperience(exp: Experience): Promise<CandidateProfile> {
    const res = await api.post<CandidateProfile>('/candidate/experiences', exp);
    return res.data;
  },

  async deleteExperience(id: number): Promise<CandidateProfile> {
    const res = await api.delete<CandidateProfile>(`/candidate/experiences/${id}`);
    return res.data;
  },

  async addEducation(edu: Education): Promise<CandidateProfile> {
    const res = await api.post<CandidateProfile>('/candidate/educations', edu);
    return res.data;
  },

  async deleteEducation(id: number): Promise<CandidateProfile> {
    const res = await api.delete<CandidateProfile>(`/candidate/educations/${id}`);
    return res.data;
  },
};
