const express = require("express");
const router = express.Router();
const { updateProfileInfo, changeProfilePassword } = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware"); // Middleware verifikasi JWT Anda

router.use(protect);

router.put("/info", updateProfileInfo);
router.put("/change-password", changeProfilePassword);

module.exports = router;