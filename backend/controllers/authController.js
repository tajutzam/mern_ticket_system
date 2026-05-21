const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET || 'SIPATEN_SUPER_SECRET_KEY_2026', 
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};


exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    const validRoles = ["Helpdesk", "NOC", "Technical", "Customer"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Role tidak valid. Pilih antara Helpdesk, NOC, Technical, atau Customer.' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Email sudah terdaftar dalam sistem.' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Helpdesk', 
      phoneNumber,
      availabilityStatus: role === 'Technical' ? 'Available' : undefined // Set status awal jika Teknisi
    });

    res.status(201).json({
      status: 'success',
      message: 'Registrasi akun petugas SIPATEN berhasil.',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat registrasi.',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Email dan password wajib diisi.' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'Kredensial salah. Email atau password tidak ditemukan.' 
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'Kredensial salah. Email atau password tidak cocok.' 
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        availabilityStatus: user.availabilityStatus
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat login.',
      error: error.message
    });
  }
};

/**
 * @desc    Mendapatkan data profile user yang sedang login saat ini
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat mengambil data pengguna.',
      error: error.message
    });
  }
};