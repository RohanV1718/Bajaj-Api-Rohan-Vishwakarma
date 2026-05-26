import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import toast from 'react-hot-toast';
import Column from './Column';
import client from '../api/client';

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];
const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

const Board = ({ tickets, setTickets, refreshStats }) => {
  // Use PointerSensor and configure it so it doesn't hijack button clicks or scroll
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require dragging 8px to start, letting clicks fall through to expand description/click buttons!
      },
    })
  );

  const isValidTransition = (current, target) => {
    if (current === target) return true;
    const currIndex = STATUS_ORDER.indexOf(current);
    const targetIndex = STATUS_ORDER.indexOf(target);
    
    if (currIndex === -1 || targetIndex === -1) return false;
    
    const diff = targetIndex - currIndex;
    return diff === 1 || diff === -1;
  };

  const handleMoveTicket = async (ticketId, targetStatus) => {
    const ticket = tickets.find((t) => (t.id || t._id) === ticketId);
    if (!ticket) return;

    const currentStatus = ticket.status;
    
    if (currentStatus === targetStatus) return;

    // Validate transition
    if (!isValidTransition(currentStatus, targetStatus)) {
      toast.error(`Invalid move: cannot transition directly from '${STATUS_LABELS[currentStatus]}' to '${STATUS_LABELS[targetStatus]}'`);
      return;
    }

    // Capture original state for rollback
    const originalTickets = [...tickets];

    // Optimistically update frontend UI
    setTickets((prevTickets) =>
      prevTickets.map((t) => {
        if ((t.id || t._id) === ticketId) {
          // Adjust resolvedAt optimistically
          let resolvedAt = t.resolvedAt;
          if (targetStatus === 'resolved' || targetStatus === 'closed') {
            resolvedAt = resolvedAt || new Date().toISOString();
          } else {
            resolvedAt = null;
          }
          return { ...t, status: targetStatus, resolvedAt };
        }
        return t;
      })
    );

    try {
      const response = await client.patch(`/tickets/${ticketId}`, { status: targetStatus });
      if (response.data.success) {
        // Sync with backend calculations (ageMinutes, slaBreached, exact resolvedAt)
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            (t.id || t._id) === ticketId ? response.data.data : t
          )
        );
        toast.success(`Ticket moved to ${STATUS_LABELS[targetStatus]}`);
        refreshStats();
      } else {
        // Revert
        setTickets(originalTickets);
        toast.error(response.data.message || 'Failed to update ticket status');
      }
    } catch (error) {
      console.error(error);
      setTickets(originalTickets);
      const serverMessage = error.response?.data?.message || 'Failed to update ticket status due to network error';
      toast.error(serverMessage);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    // Capture original state
    const originalTickets = [...tickets];

    // Optimistically update
    setTickets((prevTickets) => prevTickets.filter((t) => (t.id || t._id) !== ticketId));

    try {
      const response = await client.delete(`/tickets/${ticketId}`);
      if (response.data.success) {
        toast.success('Ticket deleted successfully');
        refreshStats();
      } else {
        setTickets(originalTickets);
        toast.error('Failed to delete ticket');
      }
    } catch (error) {
      console.error(error);
      setTickets(originalTickets);
      toast.error('Error deleting ticket');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id;
    const targetStatus = over.id; // column status

    handleMoveTicket(ticketId, targetStatus);
  };

  // Group tickets by status
  const columns = {
    open: tickets.filter((t) => t.status === 'open'),
    in_progress: tickets.filter((t) => t.status === 'in_progress'),
    resolved: tickets.filter((t) => t.status === 'resolved'),
    closed: tickets.filter((t) => t.status === 'closed'),
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4 items-start select-none">
        {STATUS_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            tickets={columns[status]}
            onMove={handleMoveTicket}
            onDelete={handleDeleteTicket}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default Board;
