import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const getColorClass = (val: number) => {
    if (val < 40) return 'bg-amber-500';
    if (val < 80) return 'bg-sky-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
        <span>Profile Completion</span>
        <span className="font-bold text-slate-900">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
        <div
          className={`h-full transition-all duration-500 rounded-full ${getColorClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
