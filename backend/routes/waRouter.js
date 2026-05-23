const express = require("express");
const router = express.Router();
const waLogController = require("../controllers/waLogController");
const { protect } = require("../middlewares/authMiddleware"); // Aktifkan jika butuh proteksi login jwt


router.use(protect)
router.get("/ticket/:ticketId", waLogController.getWALogsByTicketId);

module.exports = router;