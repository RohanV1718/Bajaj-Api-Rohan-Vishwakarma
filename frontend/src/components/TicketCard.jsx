import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  FiArrowLeft, 
  FiArrowRight, 
  FiMail, 
  FiClock, 
  FiAlertTriangle,
  FiTrash2,
  FiChevronDown,
  FiChevronUp 
} from 'react-icons/fi';
import { formatAge, getPriorityStyles } from '../utils/helpers';

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];
const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

const TicketCard = ({ ticket, onMove, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id || ticket._id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  const currentStatus = ticket.status;
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const prevStatus = currentIndex > 0 ? STATUS_ORDER[currentIndex - 1] : null;
  const nextStatus = currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;

  const priorityStyle = getPriorityStyles(ticket.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass-card p-4 rounded-xl relative select-none cursor-grab active:cursor-grabbing border ${
        ticket.slaBreached ? 'breached-card' : 'border-white/5'
      } ${isDragging ? 'opacity-40 shadow-none scale-95 border-brand-500/30' : ''}`}
    >
      {/* SLA Breach Indicator */}
      {ticket.slaBreached && (
        <div className="absolute -top-2.5 -right-1 px-2 py-0.5 rounded bg-red-600 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 flex items-center gap-1 z-10">
          <FiAlertTriangle className="animate-bounce" size={10} /> SLA Breached
        </div>
      )}

      {/* Priority Badge & Age */}
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityStyle.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
          {priorityStyle.label}
        </span>
        
        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
          <FiClock size={12} />
          <span>{formatAge(ticket.ageMinutes)}</span>
        </div>
      </div>

      {/* Subject */}
      <h4 className="text-slate-100 font-bold leading-snug tracking-tight pr-4">
        {ticket.subject}
      </h4>

      {/* Email */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
        <FiMail size={12} />
        <span className="truncate max-w-[190px]">{ticket.customerEmail}</span>
      </div>

      {/* Description section (expandable) */}
      <div className="mt-3 border-t border-white/5 pt-2">
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider hover:text-slate-200 cursor-pointer"
        >
          <span>Description</span>
          {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
        </div>

        {isExpanded && (
          <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/40 p-2 rounded border border-white/5 select-text overflow-y-auto max-h-36">
            {ticket.description}
          </p>
        )}
      </div>

      {/* Card Controls & Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 gap-2">
        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this ticket?')) {
              onDelete(ticket.id || ticket._id);
            }
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
          title="Delete Ticket"
        >
          <FiTrash2 size={14} />
        </button>

        {/* Status Transition buttons */}
        <div className="flex items-center gap-1">
          {prevStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove(ticket.id || ticket._id, prevStatus);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800/40 border border-white/5 hover:border-brand-500/30 hover:bg-brand-500/10 transition-all cursor-pointer"
              title={`Move back to ${STATUS_LABELS[prevStatus]}`}
            >
              <FiArrowLeft size={10} />
              <span>{STATUS_LABELS[prevStatus]}</span>
            </button>
          )}

          {nextStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove(ticket.id || ticket._id, nextStatus);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white bg-brand-600/70 border border-brand-500/20 hover:bg-brand-600 hover:border-brand-500/40 transition-all cursor-pointer"
              title={`Move to ${STATUS_LABELS[nextStatus]}`}
            >
              <span>{STATUS_LABELS[nextStatus]}</span>
              <FiArrowRight size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
