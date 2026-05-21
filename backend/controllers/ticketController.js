const moment = require("moment/moment");
const Ticket = require("../models/ticketModel");

exports.createTicket = async (req, res) => {
  try {
    const { customerName, phoneNumber, issueTitle, description, category } =
      req.body;

    if (
      !customerName ||
      !phoneNumber ||
      !issueTitle ||
      !description ||
      !category
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Semua field form ticket wajib diisi.",
      });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `#TCK-${dateStr}-${randomId}`;

    const newTicket = await Ticket.create({
      ticketId,
      customerName,
      phoneNumber,
      issueTitle,
      description,
      category,
      status: "OPEN",
      createdBy: req.user.id,
      statusHistory: [
        {
          status: "OPEN",
          updatedBy: req.user.id,
          note: "Tiket berhasil dibuat oleh Helpdesk.",
        },
      ],
    });

    res.status(201).json({
      status: "success",
      message: "Ticket berhasil dibuat dengan status OPEN.",
      data: newTicket,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal membuat ticket baru.",
      error: error.message,
    });
  }
};

exports.confirmTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket tidak ditemukan.",
      });
    }

    if (ticket.status !== "OPEN") {
      return res.status(400).json({
        status: "fail",
        message: "Hanya tiket dengan status OPEN yang dapat dikonfirmasi.",
      });
    }

    ticket.status = "CONFIRMED";
    ticket.statusHistory.push({
      status: "CONFIRMED",
      updatedBy: req.user.id,
      note: "Tiket dikonfirmasi oleh Helpdesk. Siap dianalisis oleh NOC.",
    });

    await ticket.save();

    res.status(200).json({
      status: "success",
      message:
        "Ticket berhasil dikonfirmasi. Status berubah menjadi CONFIRMED.",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengonfirmasi ticket.",
      error: error.message,
    });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket tidak ditemukan.",
      });
    }

    const allowedStatuses = ["OPEN", "CONFIRMED"];
    if (!allowedStatuses.includes(ticket.status)) {
      return res.status(400).json({
        status: "fail",
        message: `Ticket tidak dapat dihapus karena sudah dalam tahap pemrosesan (${ticket.status}).`,
      });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: `Ticket dengan ID ${ticket.ticketId} berhasil dihapus permanen dari sistem.`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus ticket.",
      error: error.message,
    });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { customerName, phoneNumber, issueTitle, description, category } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket tidak ditemukan.",
      });
    }

    const allowedStatuses = ["OPEN", "CONFIRMED"];
    if (!allowedStatuses.includes(ticket.status)) {
      return res.status(400).json({
        status: "fail",
        message: `Ticket tidak dapat diedit karena sudah dalam tahap penanganan teknis (${ticket.status}).`,
      });
    }

    if (customerName) ticket.customerName = customerName;
    if (phoneNumber) ticket.phoneNumber = phoneNumber;
    if (issueTitle) ticket.issueTitle = issueTitle;
    if (description) ticket.description = description;
    if (category) ticket.category = category;

    ticket.statusHistory.push({
      status: ticket.status, 
      updatedBy: req.user.id,
      note: "Data detail form tiket diperbarui oleh Helpdesk.",
    });

    const updatedTicket = await ticket.save();

    res.status(200).json({
      status: "success",
      message: "Data detail ticket berhasil diperbarui.",
      data: updatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui data ticket.",
      error: error.message,
    });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("createdBy", "name email role")
      .populate("resolvedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil daftar ticket.",
      error: error.message,
    });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("statusHistory.updatedBy", "name role");

    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket tidak ditemukan.",
      });
    }

    res.status(200).json({
      status: "success",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil detail ticket.",
      error: error.message,
    });
  }
};

exports.resolveTicketRemote = async (req, res) => {
  try {
    const { note } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        status: "fail",
        message: "Ticket tidak ditemukan.",
      });
    }

    if (ticket.status !== "CONFIRMED") {
      return res.status(400).json({
        status: "fail",
        message:
          "Hanya tiket dengan status CONFIRMED yang bisa diselesaikan langsung secara remote.",
      });
    }

    ticket.status = "CLOSED";
    ticket.resolvedBy = req.user.id;

    ticket.statusHistory.push({
      status: "RESOLVED",
      updatedBy: req.user.id,
      note: note || "Masalah berhasil diselesaikan secara remote oleh NOC.",
    });
    ticket.statusHistory.push({
      status: "CLOSED",
      updatedBy: req.user.id,
      note: "Tiket ditutup secara otomatis setelah penyelesaian remote.",
    });

    await ticket.save();


    res.status(200).json({
      status: "success",
      message:
        "Ticket berhasil diselesaikan secara remote dan langsung ditutup (CLOSED).",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menyelesaikan ticket secara remote.",
      error: error.message,
    });
  }
};


exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalOpen = await Ticket.countDocuments({ status: "OPEN" });
    const totalClosed = await Ticket.countDocuments({ status: { $in: ["CLOSED", "RESOLVED"] } });
    const totalInProgress = await Ticket.countDocuments({ 
      status: { $nin: ["OPEN", "CLOSED", "RESOLVED"] } // Memperbaiki typo di sini
    });

    const last7Days = Array.from({ length: 7 }).map((_, i) =>
      moment().subtract(i, "days").format("YYYY-MM-DD")
    ).reverse();

    const startOfRange = moment(last7Days[0]).startOf("day").toDate();
    const endOfRange = moment(last7Days[6]).endOf("day").toDate();

    const allRecentTickets = await Ticket.find({
      createdAt: { $gte: startOfRange, $lte: endOfRange }
    });

    const timelineChart = [];

    for (const dateStr of last7Days) {
      const dayTickets = allRecentTickets.filter(t => 
        t.createdAt && moment(t.createdAt).format("YYYY-MM-DD") === dateStr
      );

      const openCount = dayTickets.filter(t => t.status === "OPEN").length;
      const closedCount = dayTickets.filter(t => ["CLOSED", "RESOLVED"].includes(t.status)).length;
      const progressCount = dayTickets.length - (openCount + closedCount);

      timelineChart.push({
        label: moment(dateStr).format("DD MMM"),
        "Open": openCount,
        "In Progress": progressCount,
        "Closed / Resolved": closedCount
      });
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          open: totalOpen,
          inProgress: totalInProgress,
          closed: totalClosed,
          total: totalOpen + totalInProgress + totalClosed
        },
        chartData: timelineChart
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memuat statistik dashboard.",
      error: error.message
    });
  }
};


exports.trackTicketPublic = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({ ticketId:`#${ticketId}` })
      .populate("statusHistory.updatedBy", "name role")
      .populate("createdBy", "name role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Nomor tiket tidak ditemukan dalam sistem kami. Periksa kembali penulisan ID Anda."
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memproses pelacakan tiket.",
      error: error.message
    });
  }
};