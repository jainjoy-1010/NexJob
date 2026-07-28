import React from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { WorkMode, ExperienceLevel, SalaryType } from '../../types';
import { JobFilterParams } from '../../services/jobService';

interface JobFilterBarProps {
  filters: JobFilterParams;
  onChange: (newFilters: JobFilterParams) => void;
  onReset: () => void;
}

export const JobFilterBar: React.FC<JobFilterBarProps> = ({ filters, onChange, onReset }) => {
  const handleInputChange = (field: keyof JobFilterParams, value: any) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 mb-8">
      {/* Top Search Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Title or Company Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by job title, company, or tech stack..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="wellfound-input pl-10"
          />
        </div>

        {/* Location Search */}
        <div className="md:col-span-6 relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Location (e.g. Remote, San Francisco, Bangalore)"
            value={filters.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="wellfound-input pl-10"
          />
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Work Mode */}
          <select
            value={filters.workMode || ''}
            onChange={(e) => handleInputChange('workMode', e.target.value ? (e.target.value as WorkMode) : undefined)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">Onsite</option>
          </select>

          {/* Experience Level */}
          <select
            value={filters.experienceLevel || ''}
            onChange={(e) => handleInputChange('experienceLevel', e.target.value ? (e.target.value as ExperienceLevel) : undefined)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">All Experience</option>
            <option value="ENTRY">Entry Level</option>
            <option value="MID">Mid Level</option>
            <option value="SENIOR">Senior Level</option>
            <option value="LEAD">Lead / Manager</option>
          </select>

          {/* Salary Type & Min */}
          <select
            value={filters.salaryType || ''}
            onChange={(e) => handleInputChange('salaryType', e.target.value ? (e.target.value as SalaryType) : undefined)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">All Salary Types</option>
            <option value="LPA">LPA (Per Annum)</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>

        <button
          onClick={onReset}
          className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
        </button>
      </div>
    </div>
  );
};
