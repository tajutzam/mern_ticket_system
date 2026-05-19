const mongoose = require("mongoose");

const waLogSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket ID wajib dikaitkan dengan log WA"],
    },
    recipientName: {
      type: String,
      required: [true, "Nama penerima wajib dicatat"], // PT ABC atau Nama Teknisi
    },
    recipientRole: {
      type: String,
      enum: ["Customer", "Technical", "NOC", "Helpdesk"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Nomor WhatsApp tujuan wajib diisi"], // Format internasional e.g., '628xxx'
    },
    messageType: {
      type: String,
      enum: [
        "TICKET_CONFIRMED",   // Langkah 5: Ke Customer
        "ASSIGNMENT_NOTIF",   // Langkah 10: Ke Teknisi
        "TICKET_RESOLVED",    // Case A: Ke Customer
        "TICKET_CLOSED"       // Langkah 15: Ke Customer
      ],
      required: true,
    },
    messageContent: {
      type: String,
      required: [true, "Isi pesan WhatsApp wajib dicatat"],
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "DELIVERED", "FAILED"],
      default: "PENDING",
    },
    errorMessage: {
      type: String, // Menyimpan detail error jika status FAILED (misal: "API Timeout", "Invalid Number")
      default: null,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, 
  }
);

waLogSchema.index({ ticketId: 1 });
waLogSchema.index({ phoneNumber: 1 });

module.exports = mongoose.model("WALog", waLogSchema);