//controllers/ReservationController
const Booking = require("../models/Booking");
const BookingDish = require("../models/BookingDish");
const Table = require("../models/Table");
const User = require("../models/User");
const Guest = require("../models/Guest");

exports.getAllReservation = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("userId", "fullname email phoneNumber")
            .populate("tableId", "tableNumber capacity")
            .lean();

        const bookingIds = bookings.map(booking => booking._id);

        const bookingDishes = await BookingDish.find({ bookingId: { $in: bookingIds } })
            .populate("dishId", "name price")
            .lean();

        const guests = await Guest.find({ bookingId: { $in: bookingIds } }).lean();

        const bookingsWithDetails = bookings.map(booking => {
            return {
                ...booking,
                dishes: bookingDishes.filter(dish => dish.bookingId.toString() === booking._id.toString()),
                guest: guests.find(guest => guest.bookingId.toString() === booking._id.toString()) || null
            };
        });

        //sắp xếp
        const statusOrder = {
            pending: 1,
            confirmed: 2,
            canceled: 3
        };
        bookingsWithDetails.sort((a, b) => {
            const statusA = statusOrder[a.status.toLowerCase()] || 4;
            const statusB = statusOrder[b.status.toLowerCase()] || 4;
            return (
                statusA - statusB ||
                new Date(a.bookingDate) - new Date(b.bookingDate) ||
                a.startTime.localeCompare(b.startTime)
            );
        });


        res.status(200).json(bookingsWithDetails);
    } catch (error) {
        console.error("Error when getting table order list:", error.message);
        res.status(500).json({ message: "Error getting table order list!", error: error.message });
    }
};

exports.getStaffReservation = async (req, res) => {
    try {
        const bookings = await Booking.find({
            status: { $in: ["Confirmed", "Canceled", "confirmed", "canceled"] }
        })
            .populate("userId", "fullname email phoneNumber")
            .populate("tableId", "tableNumber capacity")
            // .sort({ bookingDate: 1, startTime: 1 })
            .sort({
                status: -1,
                bookingDate: 1,
                startTime: 1,
                createdAt: 1
            })

            .lean();

        const bookingIds = bookings.map(booking => booking._id);
        const bookingDishes = await BookingDish.find({ bookingId: { $in: bookingIds } })
            .populate("dishId", "name price imageUrl")
            .lean();

        const guests = await Guest.find({ bookingId: { $in: bookingIds } }).lean();

        const bookingsWithDetails = bookings.map(booking => {
            return {
                ...booking,
                dishes: bookingDishes.filter(dish => dish.bookingId.toString() === booking._id.toString()),
                guest: guests.find(guest => guest.bookingId.toString() === booking._id.toString()) || null
            };
        });
        res.status(200).json(bookingsWithDetails);
    } catch (error) {
        console.error("Error when getting table order list:", error.message);
        res.status(500).json({ message: "Error getting table order list!", error: error.message });
    }
};

exports.getReservationDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("tableId", "tableNumber capacity")
            .lean();

        if (!booking) {
            return res.status(404).json({ message: "Order does not exist!" });
        }

        const bookingDishes = await BookingDish.find({ bookingId: booking._id })
            .populate("dishId", "name price category isAvailable")
            .lean();

        booking.dishes = bookingDishes.map(dish => ({
            dishId: dish.dishId?._id || null,
            name: dish.dishId?.name || "Unknown",
            price: dish.dishId?.price || 0,
            category: dish.dishId?.category?.name || "Unknown",
            isAvailable: dish.dishId?.isAvailable ?? false,
            quantity: dish.quantity || 0,
        }));

        if (booking.userId) {
            const user = await User.findById(booking.userId).lean();
            if (!user) {
                return res.status(404).json({ message: "User does not exist!" });
            }

            booking.customer = {
                name: user.fullname || "No name",
                email: user.email || "No email",
                contactPhone: user.phoneNumber || "No phone number",
            };
        } else {
            const guest = await Guest.findOne({ bookingId: booking._id }).lean();
            if (!guest) {
                return res.status(404).json({ message: "Guest information does not exist!" });
            }

            booking.customer = {
                name: guest.name || "No name",
                email: guest.email || "No email",
                contactPhone: guest.contactPhone || "No phone number",
            };
        }

        let bookingDate = new Date(booking.bookingDate);
        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({ message: "Invalid booking date!" });
        }

        booking.bookingDate = bookingDate.toISOString().split("T")[0];  // YYYY-MM-DD
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving reservation information!", error: error.message });
    }
};

exports.updateReservationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Order does not exist!' });
        }

        if (booking.status === status) {
            return res.status(400).json({ message: `The order is in status "${status}" rồi!` });
        }

        booking.status = status;
        await booking.save();
        console.log(`Order ${id} status has been updated to "${status}".`);

        res.status(200).json({
            message: `Order status has been updated to "${status}".`,
            booking,
        });
    } catch (error) {
        console.error("Error updating booking status:", error.message);
        res.status(500).json({ message: 'Error updating order status!', error: error.message });
    }
};

const mongoose = require("mongoose");
exports.filterReservations = async (req, res) => {
    try {
        const { fromDate, toDate, dateRange, orderType, status, searchText } = req.query;

        let filter = {};
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        if (dateRange) {
            switch (dateRange) {
                case "today":
                    filter.bookingDate = { $gte: startOfToday, $lte: endOfToday };
                    break;
                case "yesterday":
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    filter.bookingDate = {
                        $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
                        $lte: new Date(yesterday.setHours(23, 59, 59, 999)),
                    };
                    break;
                case "last7days":
                    filter.bookingDate = { $gte: new Date(today.setDate(today.getDate() - 7)), $lte: endOfToday };
                    break;
                case "thisMonth":
                    filter.bookingDate = {
                        $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                        $lte: new Date(today.getFullYear(), today.getMonth() + 1, 0),
                    };
                    break;
                case "lastMonth":
                    filter.bookingDate = {
                        $gte: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                        $lte: new Date(today.getFullYear(), today.getMonth(), 0),
                    };
                    break;
            }
        }

        if (fromDate || toDate) {
            filter.bookingDate = {};
            if (fromDate) filter.bookingDate.$gte = new Date(fromDate);
            if (toDate) {
                filter.bookingDate.$lte = new Date(new Date(toDate).setHours(23, 59, 59, 999));
            }
        }


        if (orderType || status) {
            filter.$and = [];
            if (orderType) filter.$and.push({ orderType });
            if (status) filter.$and.push({ status: { $regex: `^${status}$`, $options: "i" } });
        }

        if (searchText) {
            const searchRegex = { $regex: searchText, $options: "i" };

            const users = await User.find({ fullname: searchRegex }).select("_id").lean();
            const userIds = users.map(user => user._id);

            const guests = await Guest.find({ name: searchRegex }).select("bookingId").lean();
            const bookingIdsFromGuest = guests.map(guest => guest.bookingId);

            if (userIds.length > 0 || bookingIdsFromGuest.length > 0) {
                filter.$or = [
                    ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
                    ...(bookingIdsFromGuest.length > 0 ? [{ _id: { $in: bookingIdsFromGuest } }] : []),
                ];
            } else {
                return res.status(200).json([]);
            }
        }

        let bookings = await Booking.find(filter)
            .populate("userId", "fullname email phoneNumber")
            .populate("tableId", "tableNumber capacity")
            .sort({ bookingDate: 1, startTime: 1 })
            .lean();
        const statusOrder = { pending: 1, confirmed: 2, canceled: 3 };
        bookings = bookings.sort((a, b) => {
            const statusA = statusOrder[a.status.toLowerCase()] || 4;
            const statusB = statusOrder[b.status.toLowerCase()] || 4;
            return statusA - statusB || new Date(a.bookingDate) - new Date(b.bookingDate) || a.startTime.localeCompare(b.startTime);
        });


        const bookingIds = bookings.map(booking => booking._id);

        const bookingDishes = await BookingDish.find({ bookingId: { $in: bookingIds } })
            .populate("dishId", "name imageUrl price")
            .lean();

        const guests = await Guest.find({ bookingId: { $in: bookingIds } }).lean();

        bookings = bookings.map(booking => ({
            ...booking,
            dishes: bookingDishes.filter(dish => dish.bookingId.toString() === booking._id.toString()),
            guest: guests.find(guest => guest.bookingId.toString() === booking._id.toString()) || null,
        }));


        res.status(200).json(bookings);
    } catch (error) {
        console.error("🔥🔥 ERROR in filterReservations:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.filterChefReservations = async (req, res) => {
    try {
        const { fromDate, toDate, dateRange, orderType, searchText, status } = req.query;
        let filter = {
            status: { $in: ["Confirmed", "Canceled", "confirmed", "canceled"] }
        };

        if (status) {
            filter.status = { $regex: new RegExp(`^${status}$`, "i") };
        }

        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        if (dateRange) {
            switch (dateRange) {
                case "today":
                    filter.bookingDate = { $gte: startOfToday, $lte: endOfToday };
                    break;
                case "yesterday":
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    filter.bookingDate = {
                        $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
                        $lte: new Date(yesterday.setHours(23, 59, 59, 999)),
                    };
                    break;
                case "last7days":
                    filter.bookingDate = { $gte: new Date(today.setDate(today.getDate() - 7)), $lte: endOfToday };
                    break;
                case "thisMonth":
                    filter.bookingDate = {
                        $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                        $lte: new Date(today.getFullYear(), today.getMonth() + 1, 0),
                    };
                    break;
                case "lastMonth":
                    filter.bookingDate = {
                        $gte: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                        $lte: new Date(today.getFullYear(), today.getMonth(), 0),
                    };
                    break;
            }
        }

        if (fromDate || toDate) {
            filter.bookingDate = {};
            if (fromDate) filter.bookingDate.$gte = new Date(fromDate);
            if (toDate) {
                filter.bookingDate.$lte = new Date(new Date(toDate).setHours(23, 59, 59, 999));
            }
        }

        if (orderType) {
            filter.orderType = orderType;
        }

        if (searchText) {
            const searchRegex = { $regex: searchText, $options: "i" };

            const users = await User.find({ fullname: searchRegex }).select("_id").lean();
            const userIds = users.map(user => user._id);

            const guests = await Guest.find({ name: searchRegex }).select("bookingId").lean();
            const bookingIdsFromGuest = guests.map(guest => guest.bookingId);

            if (userIds.length > 0 || bookingIdsFromGuest.length > 0) {
                filter.$or = [
                    ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
                    ...(bookingIdsFromGuest.length > 0 ? [{ _id: { $in: bookingIdsFromGuest } }] : []),
                ];
            } else {
                return res.status(200).json([]);
            }
        }

        let bookings = await Booking.find(filter)
            .populate("userId", "fullname email phoneNumber")
            .populate("tableId", "tableNumber capacity")
            .sort({
                status: -1,
                bookingDate: 1,
                startTime: 1,
                createdAt: 1
            })
            .lean();

        const bookingIds = bookings.map(booking => booking._id);

        const bookingDishes = await BookingDish.find({ bookingId: { $in: bookingIds } })
            .populate("dishId", "name imageUrl")
            .lean();

        const guests = await Guest.find({ bookingId: { $in: bookingIds } }).lean();

        bookings = bookings.map(booking => ({
            ...booking,
            dishes: bookingDishes.filter(dish => dish.bookingId.toString() === booking._id.toString()),
            guest: guests.find(guest => guest.bookingId.toString() === booking._id.toString()) || null,
        }));

        res.status(200).json(bookings);
    } catch (error) {
        console.error("🔥🔥 ERROR in filterReservations:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


exports.deleteBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        // Xóa các món ăn liên quan trong BookingDish
        await BookingDish.deleteMany({ bookingId });

        // Xóa các khách trong Guest
        await Guest.deleteMany({ bookingId });

        // Xóa đơn đặt bàn (booking)
        const deletedBooking = await Booking.findByIdAndDelete(bookingId);

        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking and related information deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};