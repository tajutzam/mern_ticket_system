const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[2] || req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Anda belum login. Silakan sertakan token untuk mengakses fitur ini.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'SIPATEN_SUPER_SECRET_KEY_2026'
    );

    const currentUser = await User.findById(decoded.id).select('-password'); 
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'Pengguna pemilik token ini sudah tidak terdaftar lagi.',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid atau telah kedaluwarsa.',
      error: error.message,
    });
  }
};