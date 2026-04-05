const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/recordController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");

const recordValidation = [
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    validate
];

router.post("/", auth, authorize("admin"), recordValidation, ctrl.createRecord);
router.get("/", auth, authorize("admin", "analyst", "viewer"), ctrl.getRecords);
router.put("/:id", auth, authorize("admin"), ctrl.updateRecord);
router.delete("/:id", auth, authorize("admin"), ctrl.deleteRecord);

module.exports = router;