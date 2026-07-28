import { api } from './api';
import { Resume } from '../types';

export const resumeService = {
  async getResumes(): Promise<Resume[]> {
    const res = await api.get<Resume[]>('/resumes');
    return res.data;
  },

  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<Resume>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async setPrimary(id: number): Promise<Resume> {
    const res = await api.patch<Resume>(`/resumes/${id}/primary`);
    return res.data;
  },

  async renameResume(id: number, newFileName: string): Promise<Resume> {
    const res = await api.put<Resume>(`/resumes/${id}/rename`, { newFileName });
    return res.data;
  },

  async deleteResume(id: number): Promise<void> {
    await api.delete(`/resumes/${id}`);
  },

  getPreviewUrl(id: number): string {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseURL}/resumes/${id}/preview`;
  },
};
