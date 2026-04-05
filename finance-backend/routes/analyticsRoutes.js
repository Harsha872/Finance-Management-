const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/analyticsController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.get("/summary", auth, authorize("admin", "analyst", "viewer"), ctrl.getSummary);
router.get("/insights", auth, authorize("admin", "analyst"), ctrl.getInsights);
router.get("/trends", auth, authorize("admin", "analyst"), ctrl.getTrends);
router.get("/categories", auth, authorize("admin", "analyst"), ctrl.getCategoryBreakdown);
router.get("/report", auth, authorize("admin"), ctrl.downloadReport);
router.post("/assistant", auth, authorize("admin", "analyst", "viewer"), ctrl.askAssistant);

module.exports = router;