const User = require('../models/userModel');

/**
 * @desc    Mengambil daftar user (Bisa difilter berdasarkan ?role=...)
 * @route   GET /api/users
 * @access  Private (NOC / Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    const filter = {};
    
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password'); 

    res.status(200).json({ 
      success: true, 
      results: users.length,
      data: users 
    });
  } catch (error) {
    next(error);
  }
};


const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email sudah terdaftar');
    }

    const user = await User.create({ 
      name, 
      email, 
      password,
      role: role || 'Customer', // Default role jika tidak diisi
      phoneNumber
    });
    
    user.password = undefined;

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengubah status ketersediaan teknisi (NOC / Mandiri)
 * @route   PUT /api/users/:id/status
 * @access  Private
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { availabilityStatus } = req.body;

    const allowedStatuses = ["Available", "Busy"];
    if (!availabilityStatus || !allowedStatuses.includes(availabilityStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status ketersediaan tidak valid. Harus 'Available' atau 'Busy'."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { availabilityStatus },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan."
      });
    }

    res.status(200).json({
      success: true,
      message: `Status ketersediaan ${user.name} berhasil diperbarui menjadi ${user.availabilityStatus}.`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserStatus,
};
