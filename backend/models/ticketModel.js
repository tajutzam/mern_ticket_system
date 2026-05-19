const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true, // Contoh: #001
    },
    customerName: {
      type: String,
      required: [true, "Nama customer wajib diisi"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Nomor telepon customer wajib diisi"],
    },
    issueTitle: {
      type: String,
      required: [true, "Judul masalah wajib diisi"],
    },
    description: {
      type: String,
      required: [true, "Deskripsi masalah wajib diisi"],
    },
    category: {
      type: String,
      required: [true, "Kategori wajib diisi"],
    },
    status: {
      type: String,
      enum: ["OPEN", "CONFIRMED", "ASSIGNED", "IN PROGRESS", "ON SITE", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Menunjuk ke Helpdesk yang membuat ticket
      required: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Menunjuk ke NOC jika selesai via Case A (Remote)
    },
    statusHistory: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);