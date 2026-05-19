const User = require('../models/userModel');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};


const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email sudah terdaftar');
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
};