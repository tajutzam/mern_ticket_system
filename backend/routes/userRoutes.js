const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserStatus } = require('../controllers/userController');

router.route('/').get(getUsers).post(createUser);
router.put('/:id/status', updateUserStatus )

module.exports = router;