import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FiCheckSquare, FiInbox } from 'react-icons/fi';
import TicketCard from './TicketCard';
import { getColumnDetails } from '../utils/helpers';

const Column = ({ status, tickets, onMove, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const details = getColumnDetails(status);

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col min-w-[270px] w-full max-w-[340px] rounded-2xl border ${
        isOver 
          ? 'border-brand-500/40 bg-brand-500/5 ring-4 ring-brand-500/5' 
          : 'border-white/5 bg-slate-900/10'
      } transition-all duration-200 overflow-hidden flex-1 h-[calc(100vh-320px)] min-h-[500px]`}
    >
      {/* Column Header */}
      <div className={`px-4 py-3 border-t-4 ${details.color} bg-slate-900/45 flex items-center justify-between border-b border-white/5`}>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm tracking-wide uppercase text-slate-100">{details.title}</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-white/5">
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Tickets List */}
      <div 
        className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors duration-200 ${details.bg}`}
      >
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id || ticket._id}
              ticket={ticket}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl py-12 px-4 text-center">
            {status === 'resolved' || status === 'closed' ? (
              <FiCheckSquare className="text-slate-600 mb-2.5 animate-pulse" size={24} />
            ) : (
              <FiInbox className="text-slate-600 mb-2.5" size={24} />
            )}
            <p className="text-xs text-slate-400 font-semibold tracking-tight">No tickets in this column</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[150px] mx-auto leading-relaxed">
              Drag tickets here or use transfer buttons to update.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
