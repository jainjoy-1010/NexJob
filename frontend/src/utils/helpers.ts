// Utility helpers shared across the frontend

/** Format salary range with LPA or Monthly label */
export function formatSalary(
  salaryMin?: number | null,
  salaryMax?: number | null,
  salaryType?: 'LPA' | 'MONTHLY' | string
): string {
  if (!salaryMin && !salaryMax) return 'Salary not disclosed';
  const suffix = salaryType === 'MONTHLY' ? '/mo' : ' LPA';
  const symbol = '₹';
  if (salaryMin && salaryMax) return `${symbol}${salaryMin}–${salaryMax}${suffix}`;
  return `${symbol}${salaryMin || salaryMax}${suffix}`;
}

/** Format file size bytes to KB/MB */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/** Format ISO date string to readable date */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Relative time like "3 days ago" */
export function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

/** Get Axios error message from response or fallback */
export function getErrorMessage(err: any, fallback = 'Something went wrong'): string {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

/** Get first letter for avatar placeholder */
export function getInitial(name?: string): string {
  return name ? name.charAt(0).toUpperCase() : '?';
}
