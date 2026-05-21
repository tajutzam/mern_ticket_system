const Assignment = require("../models/Assigment");
const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");

/**
 * @desc    Menerbitkan Surat Penugasan Teknisi Lapangan (Case B oleh NOC)
 * @route   POST /api/assignments
 * @access  Private (Hanya akun role NOC)
 */
const createAssignment = async (req, res, next) => {
  try {
    const { ticketId, technicianId, note, priority } = req.body;

    const assignedBy = req.user ? req.user._id : req.body.assignedBy;

    if (!assignedBy) {
      return res.status(401).json({
        success: false,
        message: "Aksi ditolak. ID Petugas NOC yang bertanggung jawab tidak terdeteksi.",
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Berkas tiket tidak ditemukan." });
    }

    if (ticket.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: `Tiket tidak dapat didelegasikan karena status tracker saat ini sudah ${ticket.status}.`,
      });
    }

    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== "Technical") {
      return res.status(404).json({
        success: false,
        message: "Akun teknisi lapangan tidak ditemukan atau tidak valid.",
      });
    }

    if (technician.availabilityStatus !== "Available") {
      return res.status(400).json({
        success: false,
        message: `Gagal menugaskan. ${technician.name} saat ini sedang sibuk (Busy) di lapangan.`,
      });
    }

    // Menginisialisasi progressUpdates awal saat penugasan dibuat
    const assignment = await Assignment.create({
      ticketId,
      assignedBy,
      technicianId,
      note,
      priority: priority || "Medium",
      status: "Pending",
      progressUpdates: [
        {
          note: "Surat tugas dicetak dan didelegasikan oleh Tim NOC pusat.",
          statusAtTime: "ASSIGNED",
          updatedBy: assignedBy
        }
      ],
    });

    ticket.status = "ASSIGNED";
    
    // Sinkronisasi riwayat tiket utama
    if (ticket.statusHistory) {
      ticket.statusHistory.push({
        status: "ASSIGNED",
        note: `Tiket didelegasikan kepada ${technician.name}. Instruksi: ${note || "-"}`,
        updatedBy: assignedBy,
        updatedAt: new Date()
      });
    }
    await ticket.save();

    technician.availabilityStatus = "Busy";
    await technician.save();

    res.status(201).json({
      success: true,
      message: `Surat tugas berhasil diterbitkan untuk teknisi: ${technician.name}`,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mendapatkan semua daftar penugasan milik teknisi yang sedang login
 * @route   GET /api/assignments/my-tasks
 * @access  Private (Technical Only)
 */
const getMyTasks = async (req, res, next) => {
  try {
    const technicianId = req.user._id;

    const tasks = await Assignment.find({ technicianId })
      .populate("ticketId", "ticketId customerName category issueTitle status description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Teknisi menyetujui / mengambil perintah kerja yang bermutu Pending
 * @route   PUT /api/assignments/:id/accept
 * @access  Private (Technical Only)
 */
const acceptTask = async (req, res, next) => {
  try {
    const assignmentId = req.params.id;
    const technicianId = req.user._id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Surat tugas tidak ditemukan." });
    }

    if (assignment.technicianId.toString() !== technicianId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Aksi ditolak. Anda tidak berhak mengambil alih tugas ini.",
      });
    }

    if (assignment.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Surat tugas ini tidak bisa diterima karena statusnya sudah ${assignment.status}.`,
      });
    }

    assignment.status = "Accepted";
    assignment.progressUpdates.push({
      note: "Surat tugas telah dikonfirmasi dan diterima oleh teknisi lapangan.",
      statusAtTime: "CONFIRMED",
      updatedBy: technicianId,
      updatedAt: new Date()
    });
    await assignment.save();

    const ticket = await Ticket.findById(assignment.ticketId);
    if (ticket) {
      const logData = {
        status: "CONFIRMED",
        note: "Teknisi telah menerima berkas surat tugas dan bersiap menuju lokasi.",
        updatedBy: technicianId,
        updatedAt: new Date(),
      };

      if (ticket.statusHistory) ticket.statusHistory.push(logData);
      ticket.status = "CONFIRMED";
      await ticket.save();
    }

    res.status(200).json({
      success: true,
      message: "Perintah kerja berhasil diterima. Segera merapat ke lokasi gangguan.",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mendapatkan detail satu lembar kerja penugasan berdasarkan ID
 * @route   GET /api/assignments/:id
 * @access  Private (Staff Lapangan / NOC / Helpdesk)
 */
const getAssignmentById = async (req, res, next) => {
  try {
    const assignmentId = req.params.id;

    const assignment = await Assignment.findById(assignmentId)
      .populate({
        path: "ticketId",
        select: "ticketId customerName phoneNumber issueTitle description category status address createdAt statusHistory"
      })
      .populate("assignedBy", "name role");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Lembar surat penugasan tidak ditemukan dalam sistem."
      });
    }

    if (req.user.role === "Technical" && assignment.technicianId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Aksi ditolak. Anda tidak memiliki hak akses untuk melihat lembar kerja teknisi lain."
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Format ID penugasan tidak valid."
      });
    }
    next(error);
  }
};

/**
 * @desc    Memperbarui tahapan status operasional penugasan teknisi di lapangan (On Site / In Progress / Resolved)
 * @route   PUT /api/assignments/:id/status
 * @access  Private (Technical Only)
 */
const updateAssignmentStatus = async (req, res, next) => {
  try {
    const assignmentId = req.params.id;
    const { status } = req.body; // Menerima "On Site", "In Progress", atau "Resolved"
    const technicianId = req.user._id;

    // 1. Validasi opsi input status
    const allowedStatus = ["On Site", "In Progress", "Resolved"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Pembaruan status operasional lapangan tidak valid." });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Surat penugasan tidak ditemukan." });
    }

    // Pastikan teknisi yang login adalah pemilik tugas ini
    if (assignment.technicianId.toString() !== technicianId.toString()) {
      return res.status(403).json({ success: false, message: "Aksi ditolak. Anda tidak berwenang memperbarui tugas ini." });
    }

    // 2. Pemetaan log deskripsi teks & format status kapital untuk sinkronisasi tiket utama
    let noteText = "";
    let ticketStatusFormat = "";

    if (status === "On Site") {
      noteText = "Teknisi lapangan telah tiba di titik lokasi alamat penanganan pelanggan.";
      ticketStatusFormat = "ON SITE";
    } else if (status === "In Progress") {
      noteText = "Teknisi mulai mengeksekusi tindakan perbaikan fisik infrastruktur jaringan.";
      ticketStatusFormat = "IN PROGRESS";
    } else if (status === "Resolved") {
      noteText = "Kendala gangguan berhasil diatasi oleh teknisi di lokasi. Menunggu penulisan laporan kerja akhir.";
      ticketStatusFormat = "RESOLVED";
    }

    // 3. Update internal progress data penugasan
    assignment.status = status;
    assignment.progressUpdates.push({
      note: noteText,
      statusAtTime: ticketStatusFormat,
      updatedBy: technicianId,
      updatedAt: new Date()
    });
    await assignment.save();

    // 4. Sinkronisasi status dan statusHistory pada data Ticket utama
    const ticket = await Ticket.findById(assignment.ticketId);
    if (ticket) {
      ticket.status = ticketStatusFormat;
      if (ticket.statusHistory) {
        ticket.statusHistory.push({
          status: ticketStatusFormat,
          note: noteText,
          updatedBy: technicianId,
          updatedAt: new Date()
        });
      }
      await ticket.save();
    }

    res.status(200).json({
      success: true,
      message: `Status tugas lapangan berhasil diperbarui menjadi ${status}.`,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengirim lembar laporan kerja akhir teknisi (Submit Work Report) & Menutup Tiket
 * @route   POST /api/assignments/:id/report
 * @access  Private (Technical Only)
 */
const submitWorkReport = async (req, res, next) => {
  try {
    const assignmentId = req.params.id;
    const { solution, finalNote, evidenceUrl } = req.body;
    const technicianId = req.user._id;

    if (!solution || !finalNote) {
      return res.status(400).json({ success: false, message: "Komponen tindakan solusi dan catatan akhir wajib diisi." });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Surat penugasan tidak ditemukan." });
    }

    if (assignment.technicianId.toString() !== technicianId.toString()) {
      return res.status(403).json({ success: false, message: "Aksi ditolak. Anda tidak berwenang menutup tugas ini." });
    }

    // 1. Simpan lembar Work Report ke dalam objek model Assignment
    assignment.status = "Completed";
    assignment.workReport = {
      solution,
      finalNote,
      evidenceUrl: evidenceUrl || "",
      submittedAt: new Date()
    };
    assignment.progressUpdates.push({
      note: `Laporan penutupan diunggah. Solusi: ${solution}.`,
      statusAtTime: "CLOSED",
      updatedBy: technicianId,
      updatedAt: new Date()
    });
    await assignment.save();

    // 2. Tutup status berkas Ticket utama menjadi CLOSED dan catat riwayat final
    const ticket = await Ticket.findById(assignment.ticketId);
    if (ticket) {
      ticket.status = "CLOSED";
      ticket.resolvedBy = technicianId; // Menyematkan teknisi sebagai resolver
      if (ticket.statusHistory) {
        ticket.statusHistory.push({
          status: "CLOSED",
          note: `Tiket dinyatakan selesai & ditutup total. Tindakan: ${solution}. Catatan teknis: ${finalNote}`,
          updatedBy: technicianId,
          updatedAt: new Date()
        });
      }
      await ticket.save();
    }

    // 3. Kembalikan status ketersediaan user Teknisi dari "Busy" menjadi "Available"
    const technician = await User.findById(technicianId);
    if (technician) {
      technician.availabilityStatus = "Available";
      await technician.save();
    }

    res.status(200).json({
      success: true,
      message: "Laporan kerja akhir berhasil diverifikasi, tiket ditutup, dan status ketersediaan Anda kembali Available.",
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getMyTasks,
  acceptTask,
  getAssignmentById,
  updateAssignmentStatus, // Modul baru pembaruan status
  submitWorkReport         // Modul baru laporan penutupan tugas
};