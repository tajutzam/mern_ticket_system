const Assignment = require("../models/Assigment");
const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");

const createAssignment = async (req, res, next) => {
  try {
    
    const { ticketId, technicianId, note, priority } = req.body;

    const assignedBy = req.user ? req.user._id : req.body.assignedBy;

    if (!assignedBy) {
      return res.status(401).json({
        success: false,
        message: "Aksi ditolak. ID Petugas NOC yang bertanggung jawab tidak terdeteksi."
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Berkas tiket tidak ditemukan." });
    }
    
    if (ticket.status !== "CONFIRMED") {
      return res.status(400).json({ 
        success: false, 
        message: `Tiket tidak dapat didelegasikan karena status tracker saat ini sudah ${ticket.status}.` 
      });
    }

    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== "Technical") {
      return res.status(404).json({ success: false, message: "Akun teknisi lapangan tidak ditemukan atau tidak valid." });
    }

    if (technician.availabilityStatus !== "Available") {
      return res.status(400).json({ 
        success: false, 
        message: `Gagal menugaskan. ${technician.name} saat ini sedang sibuk (Busy) di lapangan.` 
      });
    }

    const assignment = await Assignment.create({
      ticketId,
      assignedBy,
      technicianId,
      note,
      priority: priority || "Medium",
      status: "Pending", 
      progressUpdates: [
      ]
    });

    ticket.status = "ASSIGNED";
    await ticket.save();

    technician.availabilityStatus = "Busy";
    await technician.save();

    res.status(201).json({
      success: true,
      message: `Surat tugas berhasil diterbitkan untuk teknisi: ${technician.name}`,
      data: assignment
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
};