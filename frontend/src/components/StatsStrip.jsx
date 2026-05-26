import React from 'react';
import { 
  FiInbox, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiArchive, 
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi';

const StatsStrip = ({ stats, loading }) => {
  const { statusCounts = {}, breachedCount = 0 } = stats || {};
  const totalTickets = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const statItems = [
    {
      label: 'All Tickets',
      value: totalTickets,
      icon: FiActivity,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10 border-slate-500/10',
    },
    {
      label: 'Open',
      value: statusCounts.open || 0,
      icon: FiInbox,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/10',
    },
    {
      label: 'In Progress',
      value: statusCounts.in_progress || 0,
      icon: FiTrendingUp,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/10',
    },
    {
      label: 'Resolved',
      value: statusCounts.resolved || 0,
      icon: FiCheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/10',
    },
    {
      label: 'Closed',
      value: statusCounts.closed || 0,
      icon: FiArchive,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10 border-slate-500/10',
    },
    {
      label: 'SLA Breached',
      value: breachedCount,
      icon: FiAlertTriangle,
      color: 'text-red-400',
      bg: breachedCount > 0 
        ? 'bg-red-500/15 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-pulse'
        : 'bg-red-500/5 border-red-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 animate-pulse h-[88px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <div 
            key={item.label}
            className={`glass-panel p-4 rounded-xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.02] ${item.bg}`}
          >
            <div>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{item.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{item.value}</h3>
            </div>
            <div className={`p-2.5 rounded-lg bg-slate-950/40 border border-white/5 ${item.color}`}>
              <IconComponent size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsStrip;
