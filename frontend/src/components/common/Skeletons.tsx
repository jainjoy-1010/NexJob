import React from 'react';

/** Skeleton card for job listings loading state */
export const JobCardSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="skeleton w-11 h-11 rounded-xl" />
      <div className="space-y-1.5 flex-1">
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton h-2.5 w-20 rounded" />
      </div>
    </div>
    <div className="skeleton h-4 w-4/5 rounded" />
    <div className="flex gap-2">
      <div className="skeleton h-5 w-16 rounded-lg" />
      <div className="skeleton h-5 w-16 rounded-lg" />
      <div className="skeleton h-5 w-20 rounded-lg" />
    </div>
    <div className="space-y-1">
      <div className="skeleton h-2.5 w-full rounded" />
      <div className="skeleton h-2.5 w-3/4 rounded" />
    </div>
    <div className="pt-3 border-t border-slate-100 flex justify-between">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  </div>
);

/** Skeleton for stats card */
export const StatCardSkeleton: React.FC = () => (
  <div className="stat-card space-y-3 animate-pulse">
    <div className="skeleton h-3 w-24 rounded" />
    <div className="skeleton h-8 w-16 rounded" />
    <div className="skeleton h-2.5 w-28 rounded" />
  </div>
);

/** Generic text line skeleton */
export const TextSkeleton: React.FC<{ width?: string }> = ({ width = 'w-full' }) => (
  <div className={`skeleton h-3 ${width} rounded`} />
);
