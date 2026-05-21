const express = require("express");
const router = express.Router();

const { createAssignment } = require("../controllers/assignmentController");
const { protect } = require("../middlewares/authMiddleware");


router.use(protect)

router.route("/")
  .post(createAssignment); 

module.exports = router;