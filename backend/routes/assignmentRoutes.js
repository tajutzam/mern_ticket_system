const express = require("express");
const router = express.Router();

const { createAssignment, getMyTasks, acceptTask, getAssignmentById, updateAssignmentStatus, submitWorkReport } = require("../controllers/assignmentController");
const { protect } = require("../middlewares/authMiddleware");


router.use(protect)

router.route("/")
  .post(createAssignment); 
// 1. Rute mengambil tugas milik pribadi (Taruh di atas rute ID)
router.route("/my-tasks").get(getMyTasks);
router.route("/:id/accept").put(acceptTask);
router.route("/:id").get(getAssignmentById);

router.route("/:id/status").put(updateAssignmentStatus);

router.route("/:id/report").post(submitWorkReport);
module.exports = router;