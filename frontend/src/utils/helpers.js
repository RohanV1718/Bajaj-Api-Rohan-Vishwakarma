/**
 * Formats duration in minutes into a readable text representation.
 * 
 * @param {number} minutes 
 * @returns {string}
 */
export const formatAge = (minutes) => {
  if (minutes === undefined || minutes === null) return '0m';
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

/**
 * Gets Tailwind styling classes for a priority badge.
 * 
 * @param {string} priority 
 * @returns {object} { bg: string, dot: string, label: string }
 */
export const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'urgent':
      return {
        bg: 'bg-red-950/40 border border-red-500/30 text-red-400',
        dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
        label: 'Urgent',
      };
    case 'high':
      return {
        bg: 'bg-orange-950/40 border border-orange-500/30 text-orange-400',
        dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]',
        label: 'High',
      };
    case 'medium':
      return {
        bg: 'bg-amber-950/40 border border-amber-500/30 text-amber-400',
        dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        label: 'Medium',
      };
    case 'low':
    default:
      return {
        bg: 'bg-slate-800/40 border border-slate-500/30 text-slate-300',
        dot: 'bg-slate-400',
        label: 'Low',
      };
  }
};

/**
 * Gets column details by status
 */
export const getColumnDetails = (status) => {
  switch (status) {
    case 'open':
      return { title: 'Open', color: 'border-t-sky-500', bg: 'bg-sky-500/5' };
    case 'in_progress':
      return { title: 'In Progress', color: 'border-t-indigo-500', bg: 'bg-indigo-500/5' };
    case 'resolved':
      return { title: 'Resolved', color: 'border-t-emerald-500', bg: 'bg-emerald-500/5' };
    case 'closed':
      return { title: 'Closed', color: 'border-t-slate-500', bg: 'bg-slate-500/5' };
    default:
      return { title: status, color: 'border-t-slate-500', bg: 'bg-slate-500/5' };
  }
};
