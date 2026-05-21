const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "ID Tiket wajib dilampirkan."],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: [true, "Petugas NOC pendelegat wajib dicatat."],
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: [true, "Teknisi lapangan wajib ditentukan."],
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "In Progress", "Completed", "Canceled", "On Site", "Resolved"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    // Mengubah 'nocNote' menjadi 'note' agar lurus dengan payload frontend
    note: {
      type: String,
      required: [true, "Instruksi atau catatan dari NOC wajib diisi."],
    },
    progressUpdates: [
      {
        note: { type: String, required: true },
        statusAtTime: { type: String, required: true }, // Misal: "ON SITE", "IN PROGRESS"
        updatedBy: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User",
          required: true 
        },
        updatedAt: { type: Date, default: Date.now },
      }
    ],
    workReport: {
      solution: { type: String },
      finalNote: { type: String },
      evidenceUrl: { type: String }, // Link foto bukti perbaikan/redaman OPM
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);