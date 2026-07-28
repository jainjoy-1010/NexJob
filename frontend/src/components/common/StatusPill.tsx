import React from 'react';
import { ApplicationStatus } from '../../types';

interface StatusPillProps {
  status: ApplicationStatus;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const statusConfig: Record<ApplicationStatus, { label: string; style: string }> = {
    APPLIED: { label: 'Applied', style: 'bg-sky-50 text-sky-700 border-sky-200' },
    SHORTLISTED: { label: 'Shortlisted', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    INTERVIEW: { label: 'Interview', style: 'bg-purple-50 text-purple-700 border-purple-200' },
    REJECTED: { label: 'Not Selected', style: 'bg-rose-50 text-rose-700 border-rose-200' },
    HIRED: { label: 'Hired 🎉', style: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold' },
  };

  const config = statusConfig[status] || { label: status, style: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border font-medium ${config.style}`}>
      {config.label}
    </span>
  );
};
