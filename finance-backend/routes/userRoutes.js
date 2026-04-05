const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/userController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.get("/", auth, authorize("admin"), ctrl.getUsers);
router.put("/:id/role", auth, authorize("admin"), ctrl.updateRole);
router.put("/:id/status", auth, authorize("admin"), ctrl.updateStatus);

module.exports = router;