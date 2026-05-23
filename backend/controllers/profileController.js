const User = require("../models/userModel");
const bcrypt = require("bcryptjs"); // 💡 Import pustaka bcrypt

/**
 * @desc    Mengubah informasi profile personal mandiri (Nama Lengkap)
 * @route   PUT /api/profile/info
 * @access  Private
 */
const updateProfileInfo = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Komponen nama lengkap wajib diisi.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Akun sesi tidak ditemukan di database.",
      });
    }

    user.name = name;
    await user.save();

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Informasi profil data diri berhasil diperbarui.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengubah kata sandi akun mandiri (Change Password)
 * @route   PUT /api/profile/change-password
 * @access  Private
 */
const changeProfilePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Seluruh kolom verifikasi kata sandi wajib diisi.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Kata sandi baru minimal harus 6 karakter sesuai kebijakan skema.",
      });
    }

    // Sertakan field password secara eksplisit jika skema Mongoose kamu mengonfigurasi `select: false`
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Akun sesi tidak ditemukan.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(412).json({
        success: false,
        message: "Kata sandi lama yang Anda masukkan tidak sesuai.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Kata sandi akun berhasil diubah. Sesi Anda tetap aman.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfileInfo,
  changeProfilePassword,
};
