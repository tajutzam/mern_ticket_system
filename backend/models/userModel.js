const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama wajib diisi"],
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      unique: true,
      match: [/.+\@.+\..+/, "Format email tidak valid"],
    },
    password: {
      type: String,
      required: [true, "Password wajib diisi"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["Helpdesk", "NOC", "Technical", "Customer"],
      required: [true, "Role wajib ditentukan"],
    },
    availabilityStatus: {
      type: String,
      enum: ["Available", "Busy"],
      default: "Available",
    },
    phoneNumber: {
      type: String,
      required: [true, "Nomor WhatsApp/Telepon wajib diisi untuk notifikasi"],
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);