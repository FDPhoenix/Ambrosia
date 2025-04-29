const Order = require("../models/Order");

exports.getOrders = async (req, res) => {
    try {
        const { userId, paymentStatus } = req.query;
        const filter = {};

        if (userId) filter.userId = userId;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const orders = await Order.find(filter)
            .populate("userId", "name email")
            .populate("bookingId")
            .sort({ createdAt: -1 });

        // Tính remainingAmount trước khi trả về
        const formattedOrders = orders.map(order => ({
            ...order.toObject(),
            remainingAmount: order.paymentStatus === "Success" ? 0 : (order.totalAmount - (order.prepaidAmount || 0))
        }));

        res.status(200).json({
            success: true,
            orders: formattedOrders,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id)
            .populate("userId", "name email")
            .populate("bookingId");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Tính remainingAmount ngay trước khi trả về
        const remainingAmount = order.paymentStatus === "Success" ? 0 : (order.totalAmount - (order.prepaidAmount || 0));

        res.status(200).json({
            success: true,
            order: {
                ...order.toObject(),
                remainingAmount
            },
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.paymentStatus !== "Deposited") {
            return res.status(400).json({
                success: false,
                message: "Only orders with 'Deposited' status can be updated to 'Success'",
            });
        }

        // Cập nhật trạng thái
        order.paymentStatus = paymentStatus;

        if (paymentStatus === "Success") {
            order.prepaidAmount = order.totalAmount;
        }

        await order.save();

        // Tính remainingAmount trước khi trả về
        const remainingAmount = paymentStatus === "Success" ? 0 : (order.totalAmount - (order.prepaidAmount || 0));

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: {
                ...order.toObject(),
                remainingAmount
            },
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
