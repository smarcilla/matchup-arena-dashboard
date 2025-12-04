'use client';

interface StatusBadgeProps {
  status: 'draft' | 'ready' | 'published';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const statusClasses = {
    draft: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
    ready: 'bg-blue-900/50 text-blue-300 border border-blue-700',
    published: 'bg-green-900/50 text-green-300 border border-green-700',
  };

  const icons = {
    draft: '📝',
    ready: '✅',
    published: '🚀',
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${statusClasses[status]}`}
    >
      <span className="mr-1">{icons[status]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
