import Ticket from '../models/Ticket.js';
import { isValidTransition } from '../utils/transitionValidator.js';

// Helpers to get SLA limits in milliseconds
const SLA_LIMITS_MS = {
  urgent: 1 * 60 * 60 * 1000,
  high: 4 * 60 * 60 * 1000,
  medium: 24 * 60 * 60 * 1000,
  low: 72 * 60 * 60 * 1000,
};

/**
 * Helper to build the MongoDB query condition for SLA breach status
 */
const buildBreachedQuery = (isBreachedOnly) => {
  if (!isBreachedOnly) return {};
  
  const now = new Date();
  return {
    $expr: {
      $let: {
        vars: {
          limitMs: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'urgent'] }, then: SLA_LIMITS_MS.urgent },
                { case: { $eq: ['$priority', 'high'] }, then: SLA_LIMITS_MS.high },
                { case: { $eq: ['$priority', 'medium'] }, then: SLA_LIMITS_MS.medium },
                { case: { $eq: ['$priority', 'low'] }, then: SLA_LIMITS_MS.low },
              ],
              default: SLA_LIMITS_MS.low,
            },
          },
          resolvedOrNow: { $ifNull: ['$resolvedAt', now] },
        },
        in: {
          $gt: [
            { $subtract: ['$$resolvedOrNow', '$createdAt'] },
            '$$limitMs',
          ],
        },
      },
    },
  };
};

/**
 * @desc    Create a new ticket
 * @route   POST /tickets
 * @access  Public
 */
export const createTicket = async (req, res, next) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    // Simple validations
    if (!subject || !description || !customerEmail || !priority) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: subject, description, customerEmail, priority',
      });
    }

    const ticket = await Ticket.create({
      subject,
      description,
      customerEmail,
      priority,
      status: 'open',
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all tickets with filtering
 * @route   GET /tickets
 * @access  Public
 */
export const getTickets = async (req, res, next) => {
  try {
    const { status, priority, breached } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (breached === 'true') {
      Object.assign(query, buildBreachedQuery(true));
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ticket status
 * @route   PATCH /tickets/:id
 * @access  Public
 */
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'Status field is required to update ticket progress',
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id of ${id}`,
      });
    }

    // Validate the status transition
    const transitionCheck = isValidTransition(ticket.status, newStatus);
    if (!transitionCheck.valid) {
      return res.status(400).json({
        success: false,
        message: transitionCheck.message,
      });
    }

    // Set or clear resolvedAt based on the transition
    if (newStatus === 'resolved' || newStatus === 'closed') {
      if (!ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }
    } else {
      // Transitioning back to open or in_progress
      ticket.resolvedAt = null;
    }

    ticket.status = newStatus;
    await ticket.save();

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a ticket
 * @route   DELETE /tickets/:id
 * @access  Public
 */
export const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id of ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ticket analytics and counts
 * @route   GET /tickets/stats
 * @access  Public
 */
export const getTicketStats = async (req, res, next) => {
  try {
    const statusCounts = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const priorityCounts = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const breachedCount = await Ticket.countDocuments(buildBreachedQuery(true));

    // Format status counts response
    const statusObj = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    statusCounts.forEach((item) => {
      if (item._id in statusObj) {
        statusObj[item._id] = item.count;
      }
    });

    // Format priority counts response
    const priorityObj = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityCounts.forEach((item) => {
      if (item._id in priorityObj) {
        priorityObj[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        statusCounts: statusObj,
        priorityCounts: priorityObj,
        breachedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
