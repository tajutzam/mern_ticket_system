const User = require('../models/userModel');

const formatRoleToMongoose = (role) => {
  if (!role) return undefined;
  const low = role.toLowerCase();
  if (low === 'noc') return 'NOC';
  return low.charAt(0).toUpperCase() + low.slice(1);
};

const formatRoleToFrontend = (userObj) => {
  if (!userObj) return null;
  const doc = userObj.toObject ? userObj.toObject() : userObj;
  if (doc.role) {
    doc.role = doc.role.toLowerCase();
  }
  return doc;
};

const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    
    // Konversi filter role dari frontend (lowercase) ke format skema Mongoose
    if (role) {
      filter.role = formatRoleToMongoose(role);
    }

    const users = await User.find(filter).select('-password'); 

    // Konversi role hasil query kembali ke lowercase agar tidak merusak UI Frontend
    const formattedUsers = users.map(u => formatRoleToFrontend(u));

    res.status(200).json({ 
      success: true, 
      results: formattedUsers.length,
      data: formattedUsers 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Registrasi akun petugas baru
 * @route   POST /api/users
 * @access  Private
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Normalisasi role ke Capital Case sebelum masuk Mongoose.create
    const mongooseRole = formatRoleToMongoose(role) || 'Customer';

    const user = await User.create({ 
      name, 
      email, 
      password,
      role: mongooseRole,
      phoneNumber
    });
    
    user.password = undefined;
    const responseData = formatRoleToFrontend(user);

    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengubah data informasi profile staf / petugas (Update User)
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, password, phoneNumber } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    // Perbarui field umum
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    // Normalisasi role ke Capital Case jika frontend mengirimkan pembaruan role
    if (role) {
      user.role = formatRoleToMongoose(role);
    }
    
    // Perbarui sandi hanya jika dikirim eksplisit dari form edit
    if (password && password.trim() !== "") {
      user.password = password; 
    }

    await user.save();
    user.password = undefined; 

    const responseData = formatRoleToFrontend(user);

    res.status(200).json({
      success: true,
      message: "Data akun petugas berhasil diperbarui.",
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Menghapus akun petugas secara permanen (Delete User)
 * @route   DELETE /api/users/:id
 * @access  Private
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Akun petugas berhasil dihapus dari sistem."
    });
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

    const responseData = formatRoleToFrontend(user);

    res.status(200).json({
      success: true,
      message: `Status ketersediaan ${user.name} berhasil diperbarui menjadi ${user.availabilityStatus}.`,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
};