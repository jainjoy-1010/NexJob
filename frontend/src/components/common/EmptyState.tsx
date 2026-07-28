import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-slate-200 rounded-2xl">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-slate-400" />
    </div>
    <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">{description}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="wellfound-btn-primary py-2 text-xs">{actionLabel}</Link>
    )}
    {actionLabel && onAction && !actionTo && (
      <button onClick={onAction} className="wellfound-btn-primary py-2 text-xs">{actionLabel}</button>
    )}
  </div>
);
