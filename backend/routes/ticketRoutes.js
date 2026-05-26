import express from 'express';
import {
  createTicket,
  getTickets,
  updateTicketStatus,
  deleteTicket,
  getTicketStats,
} from '../controllers/ticketController.js';

const router = express.Router();

router.route('/')
  .post(createTicket)
  .get(getTickets);

router.route('/stats')
  .get(getTicketStats);

router.route('/:id')
  .patch(updateTicketStatus)
  .delete(deleteTicket);

export default router;
