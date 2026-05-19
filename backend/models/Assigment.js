const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    nocNote: {
      type: String, 
    },
    progressUpdates: [
      {
        note: String,
        statusAtTime: String, 
        updatedAt: { type: Date, default: Date.now },
      }
    ],
    workReport: {
      solution: { type: String },
      finalNote: { type: String },
      evidenceUrl: { type: String }, 
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);