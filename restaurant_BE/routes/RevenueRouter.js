const express = require("express");
const { getRevenue, getOrdersByDate, exportRevenueReport, getBillDetails, printBill } = require("../controllers/RevenueController");
const { isAdmin } = require("../middlewares/isAuthenticate");  
const statisUser = require('../controllers/StatisUserController');

const router = express.Router();

router.get("/", getRevenue);
router.get("/:year/:month/:day", getOrdersByDate);
router.get("/export-revenue", exportRevenueReport);
router.get("/order/:id", getBillDetails);
router.get("/printBill/:id", printBill);

router.get('/line-chart', statisUser.getLineChartData);
router.get('/bar-chart', statisUser.getBarChartData);
router.get('/quantity', statisUser.getUserCounts);

module.exports = router;