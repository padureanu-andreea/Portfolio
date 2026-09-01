const express = require("express");
const statisticsController = require("../controllers/statisticsController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/statistics/recruitment",
  authMiddleware,
  statisticsController.getRecruitmentStatistics
);

module.exports = router;
