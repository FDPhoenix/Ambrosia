//routes/ReservationRouter.js
const express = require("express");
const router = express.Router();
const { getAllReservation, getReservationDetails, updateReservationStatus, filterReservations, getStaffReservation, filterChefReservations, deleteBooking } = require("../controllers/ReservationController");

// API lấy tất cả đơn đặt bàn
router.get("/", getAllReservation);

// API lấy tất cả đơn đặt bàn được duyệt từ Staff
router.get("/staff", getStaffReservation);

// API filter các đơn đặt bàn
router.get("/filter", filterReservations);

// API filter các đơn đặt bàn
router.get("/filters", filterChefReservations);

// API lấy chi tiết đơn đặt bàn
router.get("/:id", getReservationDetails);

// API cập nhật trạng thái đơn đặt bàn (confirm hoặc cancel)
router.put("/:id/status", updateReservationStatus);

// Xóa booking và các thông tin liên quan
router.delete('/:bookingId', deleteBooking);

module.exports = router;
