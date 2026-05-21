const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middlewares/authMiddleware'); // Pastikan auth middleware Anda sudah di-import


router.get("/track/:ticketId", ticketController.trackTicketPublic);
router.use(protect);

router.get("/dashboard-stats", ticketController.getDashboardStats);


router.route('/')
  .post(ticketController.createTicket)
  .get(ticketController.getAllTickets);

router.route('/:id')
  .get(ticketController.getTicketById)
  .delete(ticketController.deleteTicket)
  .put(ticketController.updateTicket);

router.patch('/:id/confirm', ticketController.confirmTicket);
router.patch('/:id/resolve-remote', ticketController.resolveTicketRemote);

module.exports = router;