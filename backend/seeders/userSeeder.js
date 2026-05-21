const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/userModel"); 

dotenv.config();

const seedUsers = async () => {
  try {
    const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sipaten";
    await mongoose.connect(dbURI);
    console.log("⚡ MongoDB terhubung untuk proses seeding...");

    await User.deleteMany();
    console.log("🧹 Data user lama berhasil dibersihkan.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const dummyUsers = [
      {
        name: "Helpdesk",
        email: "helpdesk@sipaten.com",
        password: hashedPassword,
        role: "Helpdesk",
        phoneNumber: "6281234567890"
      },
      {
        name: "Aris - NOC Engineer",
        email: "noc@sipaten.com",
        password: hashedPassword,
        role: "NOC",
        phoneNumber: "6289876543210"
      },
      {
        name: "Yusuf - Field Technician",
        email: "technician@sipaten.com",
        password: hashedPassword,
        role: "Technical",
        availabilityStatus: "Available",
        phoneNumber: "6285554443332"
      }
    ];

    await User.insertMany(dummyUsers);
    console.log("🌱 Data seeder untuk Helpdesk, NOC, dan Technical berhasil ditanam!");

    await mongoose.disconnect();
    console.log("🔌 Koneksi database diputuskan dengan aman. Selesai!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Terjadi kegagalan saat menjalankan seeder:", error.message);
    process.exit(1);
  }
};

seedUsers();