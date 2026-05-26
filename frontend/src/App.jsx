import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { FiPlus, FiFilter, FiActivity, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import client from './api/client';
import StatsStrip from './components/StatsStrip';
import Board from './components/Board';
import CreateTicketModal from './components/CreateTicketModal';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ statusCounts: {}, priorityCounts: {}, breachedCount: 0 });
  const [priorityFilter, setPriorityFilter] = useState('');
  const [breachedFilter, setBreachedFilter] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (priorityFilter) params.priority = priorityFilter;
      if (breachedFilter) params.breached = 'true';

      const response = await client.get('/tickets', { params });
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, breachedFilter]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await client.get('/tickets/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch tickets when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTickets();
  }, [fetchTickets]);

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  const handleTicketCreated = (newTicket) => {
    // Append the new ticket to state immediately (if it matches priority filter)
    if (!priorityFilter || newTicket.priority === priorityFilter) {
      setTickets((prev) => [newTicket, ...prev]);
    }
    // Refresh stats
    fetchStats();
  };

  const handleManualRefresh = () => {
    fetchTickets();
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-12 text-slate-100">
      {/* Toast Notification Provider */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }} 
      />

      {/* Header Area */}
      <header className="border-b border-white/5 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-xl text-white shadow-lg shadow-brand-600/30">
              <FiActivity size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                DeskFlow <span className="text-xs bg-brand-500/15 border border-brand-500/30 text-brand-400 font-extrabold px-2 py-0.5 rounded-full">v1.0</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Support Ticket Triage Board</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="p-2.5 rounded-xl border border-white/5 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-white/10 transition-all"
              title="Refresh Board Data"
            >
              <FiRefreshCw size={16} />
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-600/20 transition-all"
            >
              <FiPlus size={16} />
              <span>New Ticket</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Statistics Bar */}
        <StatsStrip stats={stats} loading={statsLoading} />

        {/* Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FiFilter size={14} className="text-slate-500" />
              <span>Filters:</span>
            </div>

            {/* Priority Filter */}
            <div className="flex bg-slate-950/60 p-0.5 rounded-lg border border-white/5">
              {[
                { value: '', label: 'All Priorities' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriorityFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    priorityFilter === opt.value
                      ? 'bg-slate-800 text-slate-200 shadow-sm border border-white/5'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* SLA Breach Filter */}
          <div className="flex items-center">
            <label className="relative flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={breachedFilter}
                onChange={(e) => setBreachedFilter(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-red-500 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500/10 peer-checked:border peer-checked:border-red-500/20"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors flex items-center gap-1.5">
                <FiAlertTriangle className={`${breachedFilter ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} size={14} />
                Show Only Breached
              </span>
            </label>
          </div>
        </div>

        {/* Board Area */}
        {loading && tickets.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl border border-white/5 h-[500px] animate-pulse flex flex-col p-4 space-y-4">
                <div className="h-6 w-24 bg-slate-800 rounded mb-2" />
                <div className="h-24 bg-slate-800/40 rounded-xl" />
                <div className="h-24 bg-slate-800/40 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <Board 
            tickets={tickets} 
            setTickets={setTickets} 
            refreshStats={fetchStats} 
          />
        )}
      </main>

      {/* Create Ticket Modal Overlay */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};

export default App;
