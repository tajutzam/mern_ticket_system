const WALog = require("../models/WALog"); // Sesuaikan path menuju model WALog Anda
const mongoose = require("mongoose");


exports.getWALogsByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        status: "error",
        message: "Format Ticket ID tidak valid.",
      });
    }

    const logs = await WALog.find({ ticketId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      results: logs.length,
      data: logs,
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Gagal memuat rekam jejak log WhatsApp.",
      error: error.message,
    });
  }
};