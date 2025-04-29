const qs = require('qs');
const moment = require('moment');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Booking = require("../models/Booking");
const BookingDish = require("../models/BookingDish");

exports.createPaymentUrl = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        
        if (!orderId) {
            return res.status(400).json({ error: "Not yet orderId" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
        }

        const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "0.0.0.0";

        let vnp_Params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: process.env.VNP_TMNCODE,
            vnp_Amount: order.totalAmount * 0.3 * 100,
            vnp_CurrCode: "VND",
            vnp_TxnRef: order._id.toString(), // ID đơn hàng
            vnp_OrderInfo: `Thanh toán đơn hàng ${order._id}`,
            vnp_OrderType: "billpayment",
            vnp_Locale: "vn",
            vnp_ReturnUrl: process.env.VNP_RETURNURL,
            vnp_IpAddr: clientIp,
            vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
        };

        // Sắp xếp tham số theo thứ tự A-Z
        vnp_Params = Object.fromEntries(Object.entries(vnp_Params).sort());

        // Tạo chuỗi query
        const signData = new URLSearchParams(vnp_Params).toString();

        // Tạo chữ ký bảo mật
        const hmac = crypto.createHmac("sha512", process.env.VNP_HASHSECRET);
        vnp_Params.vnp_SecureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        return res.json({ paymentUrl: `${process.env.VNP_URL}?${new URLSearchParams(vnp_Params).toString()}` });

    } catch (error) {
        console.error("Lỗi khi tạo URL thanh toán:", error);
        res.status(500).json({ error: "Không thể tạo URL thanh toán" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.paymentStatus !== "Deposited") {
            order.paymentStatus = "Deposited";
            await order.save();
        }

        res.json({ message: "Order updated to Success", paymentStatus: order.paymentStatus });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//Cart Checkout
exports.checkout = async (req, res) => {
    try {
        const { userId, contactPhone, deliveryAddress, totalAmount } = req.body;

        // 1. Kiểm tra giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false,
            });
        }

        // 2. Lấy danh sách món ăn trong giỏ hàng
        const cartItems = await CartItem.find({ cartId: cart._id }).populate({
            path: "dishId",
            select: "name price imageUrl description",
        });

        if (cartItems.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
                success: false,
            });
        }

        const DEPOSIT_PERCENTAGE = 0.3;
        const prepaidAmount = Math.round(totalAmount * DEPOSIT_PERCENTAGE);

        // 4. Tạo Booking với thông tin phone + address
        const booking = new Booking({
            userId,
            orderType: "delivery",
            bookingDate: new Date(),
            status: "pending",
            notes: "Created from cart checkout",
            contactPhone: contactPhone || "N/A",
            deliveryAddress: deliveryAddress || "N/A",
        });
        await booking.save();

        // 5. Chuyển CartItems thành BookingDishes
        const bookingDishes = cartItems.map((item) => ({
            bookingId: booking._id,
            dishId: item.dishId._id,
            dishName: item.dishId.name,
            quantity: item.quantity,
            priceAtTime: item.dishId.price,
        }));

        await BookingDish.insertMany(bookingDishes);

        // 6. Tạo Order liên kết với Booking
        const order = new Order({
            userId,
            bookingId: booking._id,
            totalAmount,
            prepaidAmount,
            paymentMethod: "VNPay",
            paymentStatus: "Pending",
        });
        await order.save();

        // 8. Lưu bookingId vào cookie (httpOnly để bảo mật, maxAge 1 ngày)
        res.cookie("bookingId", booking._id.toString(), { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        // 9. Trả về response
        res.status(200).json({
            message: "Order created successfully",
            orderId: order._id,
            bookingId: booking._id,
            totalAmount,
            prepaidAmount,
            bookingDishes,
            success: true,
        });
    } catch (error) {
        console.error("Error during checkout:", error);
        
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

exports.checkoutBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        // 1. Kiểm tra Booking tồn tại
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
                success: false,
            });
        }

        // 2. Kiểm tra trạng thái Booking
        if (booking.status !== "pending") {
            return res.status(400).json({
                message: "Booking is already confirmed or cancelled",
                success: false,
            });
        }

        // 3. Lấy danh sách món trong Booking
        const bookingDishes = await BookingDish.find({ bookingId }).populate({
            path: "dishId",
            select: "name price",
        });

        if (bookingDishes.length === 0) {
            return res.status(400).json({
                message: "No dishes found in this booking",
                success: false,
            });
        }

        // 4. Tính tổng tiền từ BookingDishes
        let totalAmount = 0;
        bookingDishes.forEach((item) => {
            totalAmount += item.dishId.price * item.quantity; // Lấy giá từ dishId
        });

        const DEPOSIT_PERCENTAGE = 0.3;
        const prepaidAmount = Math.round(totalAmount * DEPOSIT_PERCENTAGE);

        // 5. Tạo Order từ Booking
        const order = new Order({
            userId: booking.userId,
            bookingId: booking._id,
            totalAmount,
            prepaidAmount,
            paymentMethod: "VNPay",
            paymentStatus: "Pending",
        });
        await order.save();

        // 6. Trả về response với thông tin Order
        res.status(200).json({
            message: "Success",
            orderId: order._id,
            bookingId: booking._id,
            totalAmount,
            prepaidAmount,
            bookingDishes,
            success: true,
        });
    } catch (error) {
        console.error("Error creating order from booking:", error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};