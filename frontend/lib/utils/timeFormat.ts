/**
 * Format time difference to human-readable string
 * Examples: "2m ago", "5h ago", "3d ago", "2mo ago"
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // If in the future
  if (diffMs < 0) {
    const absDiff = Math.abs(diffMs);
    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'in <1m';
    if (minutes < 60) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h`;
    return `in ${days}d`;
  }
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

/**
 * Format time difference to detailed string
 * Examples: "2 minutes ago", "5 hours ago", "3 days ago"
 */
export function formatTimeAgoDetailed(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (diffMs < 0) {
    const absDiff = Math.abs(diffMs);
    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'in less than a minute';
    if (minutes === 1) return 'in 1 minute';
    if (minutes < 60) return `in ${minutes} minutes`;
    if (hours === 1) return 'in 1 hour';
    if (hours < 24) return `in ${hours} hours`;
    if (days === 1) return 'in 1 day';
    return `in ${days} days`;
  }
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  if (years === 1) return '1 year ago';
  return `${years} years ago`;
}
