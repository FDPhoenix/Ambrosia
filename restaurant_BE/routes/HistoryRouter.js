const express = require("express");
const HistoryController = require("../controllers/HistoryController");
const { authenticate } = require('../middlewares/isAuthenticate');
const router = express.Router();


router.get("/bookings",authenticate, HistoryController.getBookingHistory);
router.get("/booking/:id", authenticate, HistoryController.getBookingDetails);


router.get("/orders",authenticate, HistoryController.getOrderHistory);
router.get("/order/:id", authenticate, HistoryController.getOrderDetails);


module.exports = router;
