const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");
const Table = require("../models/Table");
const Dish = require("../models/Dish");
const BookingDish = require("../models/BookingDish");
const User = require("../models/User");
const Guest = require("../models/Guest");
const mongoose = require("mongoose");


exports.createBooking = async (req, res) => {
    try {
        console.log("📌 Dữ liệu nhận từ frontend:", req.body);

        const { tableId, orderType, bookingDate, startTime, notes, dishes, name, email, contactPhone } = req.body;
        let userId = req.body.userId || null; // ✅ Lấy từ req.body nếu có

        // 🔥 Nếu `userId` không có, lấy từ token
        if (!userId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(" ")[1];
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                userId = decoded.id;
                console.log("✅ userId lấy từ token:", userId);
            } catch (err) {
                return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
            }
        }

        console.log("🔹 userId sau khi kiểm tra token:", userId);

        // 🔥 Nếu không có `userId` và cũng không có thông tin khách vãng lai, báo lỗi
        if (!userId) {
            if (!name || !email || !contactPhone) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ họ tên, email và số điện thoại!" });
            }
        }

        // Kiểm tra bàn có tồn tại không
        const table = await Table.findById(tableId);
        if (!table) return res.status(404).json({ message: "Bàn không tồn tại!" });

        // Xử lý ngày và thời gian đặt bàn
        const parsedDate = new Date(bookingDate);
        const formattedBookingDate = new Date(parsedDate.toISOString().split("T")[0]);

        const bookingStart = new Date(formattedBookingDate);
        const [bookingHour, bookingMinute] = startTime.split(":").map(Number);
        bookingStart.setUTCHours(bookingHour, bookingMinute, 0, 0);
        const bookingEnd = new Date(bookingStart.getTime() + 5 * 60 * 60 * 1000);

        // Kiểm tra lịch đặt bàn có bị trùng không
        const existingBookings = await Booking.find({ tableId, bookingDate: formattedBookingDate });
        for (const booking of existingBookings) {
            const existingStart = new Date(booking.bookingDate);
            const [existingHour, existingMinute] = booking.startTime.split(":").map(Number);
            existingStart.setUTCHours(existingHour, existingMinute, 0, 0);
            const existingEnd = new Date(existingStart.getTime() + 5 * 60 * 60 * 1000);

            if (
                (bookingStart >= existingStart && bookingStart < existingEnd) ||
                (bookingEnd > existingStart && bookingEnd <= existingEnd)
            ) {
                return res.status(400).json({ message: "Bàn này đã bị đặt, vui lòng chọn giờ khác!" });
            }
        }

        // Xử lý món ăn
        let formattedDishes = [];
        if (dishes && dishes.length > 0) {
            for (const dish of dishes) {
                const dishExists = await Dish.findById(dish.dishId);
                if (!dishExists) {
                    return res.status(400).json({ message: `Món ăn không tồn tại: ${dish.dishId}` });
                }
                formattedDishes.push({
                    dishId: dishExists._id,
                    quantity: dish.quantity,
                });
            }
        }

        // 🔥 Tạo đơn đặt bàn
        const newBooking = await Booking.create({
            userId,
            tableId,
            orderType,
            bookingDate: formattedBookingDate,
            startTime,
            endTime: `${bookingHour + 5}:${String(bookingMinute).padStart(2, "0")}`,
            status: "pending",
            notes,
            contactPhone,
        });

        console.log("✅ Booking đã lưu vào DB:", newBooking);

        // Nếu là khách vãng lai, lưu vào bảng Guest
        if (!userId) {
            await Guest.create({
                bookingId: newBooking._id,
                name,
                email,
                contactPhone,
            });
        }

        // Lưu món ăn vào bảng BookingDish
        if (formattedDishes.length > 0) {
            const bookingDishes = formattedDishes.map(dish => ({
                bookingId: newBooking._id,
                dishId: dish.dishId,
                quantity: dish.quantity,
            }));
            const savedDishes = await BookingDish.insertMany(bookingDishes);
            newBooking.bookingDishes = savedDishes.map(dish => dish._id);
            await newBooking.save();
        }

        // Cập nhật trạng thái bàn
        await Table.findByIdAndUpdate(tableId, {
            status: "reserved",
            lastBookedAt: bookingStart,
            lastBookedEndTime: bookingEnd,
        });

        res.status(201).json({
            message: "Đặt bàn thành công!",
            bookingId: newBooking._id,
            booking: newBooking,
        });
    } catch (error) {
        console.error("🚨 Lỗi trong API createBooking:", error.message);
        res.status(500).json({ message: "Lỗi khi tạo đơn đặt bàn!", error: error.message });
    }
};



async function isTableAvailable(tableId, bookingDate, startTime, excludeBookingId = null) {
    try {
        console.log(`🔍 Kiểm tra bàn ${tableId} vào ${bookingDate} lúc ${startTime}...`);

        const parsedDate = new Date(bookingDate);
        const formattedBookingDate = new Date(parsedDate.toISOString().split("T")[0]);
        formattedBookingDate.setUTCHours(0, 0, 0, 0);

        const bookingStart = new Date(formattedBookingDate);
        const [bookingHour, bookingMinute] = startTime.split(":").map(Number);
        bookingStart.setUTCHours(bookingHour, bookingMinute, 0, 0);
        const bookingEnd = new Date(bookingStart.getTime() + 5 * 60 * 60 * 1000);

        const existingBookings = await Booking.find({
            tableId,
            bookingDate: formattedBookingDate,
            _id: excludeBookingId ? { $ne: excludeBookingId } : { $exists: true },
        });

        console.log("📌 Tổng số booking trong ngày:", existingBookings.length);

        for (let booking of existingBookings) {
            if (booking._id.toString() === excludeBookingId) {
                console.log("✅ Bỏ qua chính booking đang chỉnh sửa.");
                continue;
            }

            const existingStart = new Date(booking.bookingDate);
            const [existingHour, existingMinute] = booking.startTime.split(":").map(Number);
            existingStart.setUTCHours(existingHour, existingMinute, 0, 0);
            const existingEnd = new Date(existingStart.getTime() + 5 * 60 * 60 * 1000);

            if (
                (bookingStart >= existingStart && bookingStart < existingEnd) ||
                (bookingEnd > existingStart && bookingEnd <= existingEnd) ||
                (bookingStart <= existingStart && bookingEnd >= existingEnd)
            ) {
                console.log("❌ Bàn này đã bị đặt trong khoảng thời gian này!");
                return false;
            }
        }

        console.log("✅ Bàn có thể đặt!");
        return true;

    } catch (error) {
        console.error("🚨 Lỗi trong isTableAvailable:", error.message);
        return false;
    }
}


exports.getBookingDetails = async (req, res) => {
    try {
        console.log("🔍 Nhận yêu cầu lấy thông tin Booking ID:", req.params.id);

        // ✅ Tìm đơn đặt bàn
        const booking = await Booking.findById(req.params.id)
            .populate("tableId")
            .lean();

        if (!booking) {
            console.log("❌ Đơn hàng không tồn tại!");
            return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
        }

        console.log("📌 Thông tin đơn hàng sau khi tìm thấy:", booking);

        // ✅ Lấy danh sách món ăn từ `BookingDish`
        const bookingDishes = await BookingDish.find({ bookingId: booking._id })
            .populate("dishId")
            .lean();

        booking.dishes = bookingDishes.map((dish) => ({
            dishId: dish.dishId?._id || null, // Kiểm tra null trước khi đọc `_id`
            name: dish.dishId?.name || "Không xác định",
            price: dish.dishId?.price || 0,
            category: dish.dishId?.category || "Không xác định",
            isAvailable: dish.dishId?.isAvailable ?? false,
            quantity: dish.quantity || 0,
        }));

        // Kiểm tra khách hàng (đăng nhập hoặc vãng lai)
        if (booking.userId) {
            console.log("🟢 Đơn hàng thuộc về khách đã đăng nhập");

            const user = await User.findById(booking.userId).lean();
            if (!user) {
                console.log("❌ Người dùng không tồn tại!");
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }

            booking.customer = {
                name: user.fullname || "Không có tên",
                email: user.email || "Không có email",
                contactPhone: user.phoneNumber || "Không có số điện thoại",
            };
        } else {
            console.log("🟠 Đơn hàng thuộc về khách vãng lai");

            const guest = await Guest.findOne({ bookingId: booking._id }).lean();
            if (!guest) {
                console.log("❌ Thông tin khách vãng lai không tồn tại!");
                return res.status(404).json({ message: "Thông tin khách vãng lai không tồn tại!" });
            }

            booking.customer = {
                name: guest.name || "Không có tên",
                email: guest.email || "Không có email",  // Kiểm tra email từ Guest
                contactPhone: guest.contactPhone || "Không có số điện thoại",
            };
        }


        let bookingDate;
        if (typeof booking.bookingDate === "string") {
            const parts = booking.bookingDate.split("/");
            if (parts.length === 3) {
                bookingDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Chuyển từ DD/MM/YYYY → YYYY-MM-DD
            } else {
                bookingDate = new Date(booking.bookingDate);
            }
        } else if (booking.bookingDate instanceof Date) {
            bookingDate = booking.bookingDate;
        } else {
            console.log("❌ Ngày đặt không hợp lệ:", booking.bookingDate);
            return res.status(400).json({ message: "Ngày đặt không hợp lệ!" });
        }

        if (isNaN(bookingDate.getTime())) {
            console.log("❌ Ngày đặt không hợp lệ:", booking.bookingDate);
            return res.status(400).json({ message: "Ngày đặt không hợp lệ!" });
        }

        // ✅ Trả về ngày dưới dạng YYYY-MM-DD cho frontend
        booking.bookingDate = bookingDate.toISOString().split("T")[0];


        console.log("✅ Trả về dữ liệu Booking đầy đủ:", booking);

        res.status(200).json(booking);
    } catch (error) {
        console.error("🚨 Lỗi khi lấy thông tin đặt bàn:", error);
        res.status(500).json({ message: "Lỗi khi lấy thông tin đặt bàn!", error: error.message });
    }
};


/**
 * 📌 API Chỉnh Sửa Đơn Hàng
 * 
 */
exports.updateBooking = async (req, res) => {
    try {
        const { tableId, bookingDate, startTime, notes, dishes, name, email, contactPhone } = req.body;
        const bookingId = req.params.id;

        console.log("🟢 Nhận yêu cầu cập nhật đơn hàng:", req.body);

        // ✅ Tìm đơn hàng theo ID
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Đơn hàng không tồn tại!" });

        // ✅ Kiểm tra bàn mới (nếu có cập nhật bàn)
        if (tableId && tableId !== booking.tableId.toString()) {
            const table = await Table.findById(tableId);
            if (!table) return res.status(404).json({ message: "Bàn không tồn tại!" });

            // ✅ Kiểm tra xem bàn có khả dụng không
            const isAvailable = await isTableAvailable(tableId, bookingDate, startTime, bookingId);
            if (!isAvailable) {
                return res.status(400).json({ message: "Bàn đã bị đặt, vui lòng chọn bàn khác!" });
            }

            booking.tableId = tableId;
        }

        // ✅ Xử lý ngày & thời gian đặt bàn
        const parsedDate = new Date(bookingDate);
        const formattedBookingDate = new Date(parsedDate.toISOString().split("T")[0]);
        const bookingStart = new Date(formattedBookingDate);
        const [bookingHour, bookingMinute] = startTime.split(":").map(Number);
        bookingStart.setUTCHours(bookingHour, bookingMinute, 0, 0);
        const bookingEnd = new Date(bookingStart.getTime() + 5 * 60 * 60 * 1000); // +5 tiếng

        booking.bookingDate = formattedBookingDate;
        booking.startTime = startTime;

        let endHour = bookingHour + 5;
        let endDate = new Date(bookingStart);

        if (endHour >= 24) {
            endHour -= 24; // Chỉnh về giờ hợp lệ
            endDate.setDate(endDate.getDate() + 1); // Cộng thêm 1 ngày
        }

        // ✅ Lưu lại `endTime` chính xác
        booking.endTime = `${String(endHour).padStart(2, "0")}:${String(bookingMinute).padStart(2, "0")}`;
        booking.notes = notes || booking.notes;

        // ✅ Cập nhật thông tin khách hàng (chỉ nếu là khách vãng lai)
        if (!booking.userId) {
            const guest = await Guest.findOne({ bookingId: booking._id });

            if (!guest) {
                return res.status(404).json({ message: "Thông tin khách vãng lai không tồn tại!" });
            }

            guest.name = name || guest.name;
            guest.email = email || guest.email;
            guest.contactPhone = contactPhone || guest.contactPhone;
            await guest.save();
        } else {
            console.log("🟢 Khách đã đăng nhập - Không cho phép chỉnh sửa thông tin cá nhân.");
        }

        // ✅ Cập nhật danh sách món ăn (nếu có thay đổi)
        if (dishes && dishes.length > 0) {
            await BookingDish.deleteMany({ bookingId: booking._id });

            const formattedDishes = dishes.map(dish => ({
                bookingId: booking._id,
                dishId: dish.dishId,
                quantity: dish.quantity,
            }));

            const savedDishes = await BookingDish.insertMany(formattedDishes);
            booking.bookingDishes = savedDishes.map(dish => dish._id);
        } else {
            await BookingDish.deleteMany({ bookingId: booking._id });
            booking.bookingDishes = [];
        }

        await booking.save();

        // ✅ Populate lại dữ liệu sau khi cập nhật
        const updatedBooking = await Booking.findById(bookingId)
            .populate("tableId")
            .lean();

        res.status(200).json({
            message: "Cập nhật đơn hàng thành công!",
            booking: updatedBooking,
        });

    } catch (error) {
        console.error("🚨 Lỗi khi cập nhật đơn hàng:", error.message);
        res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng!", error: error.message });
    }
};

/**
 * 📌 API Hủy Đơn Hàng DELETE /bookings/:id
 */
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Đơn hàng không tồn tại!" });

        // ✅ Chỉ cho phép hủy nếu đơn hàng chưa hoàn thành
        if (booking.status === "completed") {
            return res.status(400).json({ message: "Không thể hủy đơn hàng đã hoàn thành!" });
        }

        // ✅ Xóa danh sách món ăn liên quan
        await BookingDish.deleteMany({ bookingId: booking._id });

        // ✅ Cập nhật trạng thái bàn
        const table = await Table.findById(booking.tableId);
        if (table) {
            // Kiểm tra xem bàn có đơn đặt nào khác trong tương lai không
            const existingBookings = await Booking.find({
                tableId: table._id,
                bookingDate: { $gte: new Date() },
                _id: { $ne: booking._id } // Loại bỏ đơn hiện tại
            });

            if (existingBookings.length === 0) {
                // Nếu không còn đơn nào, đặt về trạng thái "available"
                table.status = "available";
                table.lastBookedAt = null;
                table.lastBookedEndTime = null;
                await table.save();
            }
        }

        // ✅ Xóa đơn hàng
        await Booking.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Đơn hàng đã bị hủy thành công!" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * 📌 API Xác nhận hóa đơn điện tử
 */
exports.confirmBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        let booking = await Booking.findById(bookingId)
            .populate("tableId")
            .populate("userId")
            .lean();

        if (!booking) return res.status(404).json({ message: "Đơn hàng không tồn tại!" });

        if (booking.status !== "pending") {
            return res.status(400).json({ message: "Chỉ có thể xác nhận đơn hàng đang chờ xử lý!" });
        }

        // ✅ Lấy danh sách món ăn từ `BookingDish`
        let bookingDishes = await BookingDish.find({ bookingId: booking._id })
            .populate("dishId", "name price")
            .lean();

        // ✅ Tính tổng tiền hóa đơn
        let totalBill = 0;
        let dishesFormatted = [];

        if (bookingDishes.length > 0) {
            dishesFormatted = bookingDishes.map(dish => {
                totalBill += dish.quantity * (dish.dishId.price || 0);
                return {
                    name: dish.dishId.name,
                    price: dish.dishId.price || "Chưa cập nhật",
                    quantity: dish.quantity
                };
            });
        } else {
            dishesFormatted = "Order tại nhà hàng"; // Không có món ăn trong đơn
        }

        console.log("📌 Debug - Danh sách món ăn trong confirm:", dishesFormatted);
        console.log("💰 Tổng tiền hóa đơn:", totalBill);

        // ✅ **Cập nhật trạng thái đơn hàng thành "confirmed"**
        await Booking.findByIdAndUpdate(bookingId, {
            status: "confirmed",
            totalBill
        });

        let customerEmail = null;
        let customerName = null;
        let customerPhone = null;

        // Kiểm tra nếu khách hàng là người dùng đã đăng ký
        if (booking.userId) {
            customerEmail = booking.userId.email;
            customerName = booking.userId.fullname;
            customerPhone = booking.userId.phoneNumber;
        } else {
            // Nếu là khách vãng lai, tìm thông tin trong `Guest`
            let guestInfo = await Guest.findOne({ bookingId: booking._id }).lean();
            if (guestInfo) {
                customerEmail = guestInfo.email;
                customerName = guestInfo.name;
                customerPhone = guestInfo.contactPhone;
            }
        }


        if (!customerEmail) {
            console.log("❌ Không có email để gửi hóa đơn!");  // Debug thông báo
            return res.status(400).json({ message: "Không có email để gửi hóa đơn!" });
        }

        // ✅ **Gửi email xác nhận hóa đơn**
        await sendBookingEmail({
            ...booking,
            customerEmail,
            customerName,
            customerPhone,
            dishes: dishesFormatted,
            totalBill
        });

        res.status(200).json({
            message: "Xác nhận đơn hàng thành công! Email hóa đơn đã được gửi.",
            booking: {
                ...booking,
                status: "confirmed",
                dishes: dishesFormatted,
                totalBill
            }
        });

    } catch (error) {
        console.error("🚨 Lỗi trong confirmBooking:", error);
        res.status(500).json({ message: "Lỗi khi xác nhận đơn hàng!", error: error.message });
    }
};


const nodemailer = require("nodemailer");
async function sendBookingEmail(booking) {
    try {
        console.log("📤 Đang gửi email hóa đơn đến:", booking.contactPhone || "Không có số điện thoại");

        let customerName = booking.customerName || "Khách hàng";
        let customerEmail = booking.customerEmail;
        let customerPhone = booking.customerPhone || "Không có số điện thoại";


        // ✅ Kiểm tra nếu email không tồn tại
        if (!customerEmail) {
            console.log("❌ Không có email để gửi hóa đơn!");
            return;
        }

        // ✅ Xử lý danh sách món ăn
        let dishListHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 15px; color: #333;">
                <thead>
                    <tr style="text-align: left; background-color: #f1f1f1;">
                        <th style="padding: 10px; border-bottom: 2px solid #ddd;">&nbsp;Món ăn</th>
                        <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Số lượng</th>
                        <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Giá (VND)</th>
                    </tr>
                </thead>
                <tbody>`;

        if (Array.isArray(booking.dishes) && booking.dishes.length > 0) {
            booking.dishes.forEach((dish) => {
                dishListHtml += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left; background-color: #f8f8f8;">🔹 ${dish.name}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;background-color: #f8f8f8;">x${dish.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; background-color: #f8f8f8;">
                            ${(dish.price || 0).toLocaleString()} VND
                        </td>
                    </tr>`;
            });
        } else {
            dishListHtml += `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 12px; font-weight: bold; color: #888;background-color: #f8f8f8">
                        Khách hàng sẽ gọi món tại nhà hàng.
                    </td>
                </tr>`;
        }

        dishListHtml += `
                <tr style="background-color: #f8f8f8;">
                    <td colspan="2" style="padding: 10px; font-weight: bold; text-align: left; background-color: #f1f1f1;">💰&nbsp; Tổng tiền (Chưa bao gồm thuế):</td>
                    <td style="padding: 10px; font-weight: bold; color: #27ae60; text-align: right; background-color: #f1f1f1;">
                        ${(booking.totalBill || 0).toLocaleString()} VND
                    </td>
                </tr>
            </tbody>
        </table>`;

        // ✅ **Thêm phần hiển thị GHI CHÚ của khách hàng**
        let notesHtml = "";
        if (booking.notes && booking.notes.trim() !== "") {
            notesHtml = `
                <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 5px solid #ff9900;">
                    <h4 style="margin: 0; color: #d35400;">📌 Ghi chú từ khách hàng:</h4>
                    <p style="margin: 5px 0; color: #333; font-size: 16px;">"${booking.notes}"</p>
                </div>`;
        }

        const mailContent = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #2c3e50; font-size: 25px; font-weight: bold;">✅ Cảm ơn bạn đã đặt bàn!</h1>
                <p style="font-size: 16px; color: #555;">Dưới đây là thông tin đơn đặt bàn của bạn:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px;">
                    <tr>
                        <td style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;"><b>👤&nbsp; Khách hàng:</b></td>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">${customerName}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;"><b>📞&nbsp; Số điện thoại:</b></td>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">${customerPhone}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;"><b>📅&nbsp; Ngày đặt:</b></td>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">${booking.bookingDate.toLocaleDateString("vi-VN")}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;"><b>⏰&nbsp; Giờ đặt:</b></td>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">${booking.startTime}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;"><b>🍽️&nbsp; Bàn số:</b></td>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">${booking.tableId.tableNumber}</td>
                    </tr>
                </table>

                 ${notesHtml}
                ${dishListHtml}

                <p style="font-size: 16px; color: #555; margin-top: 30px;">✨ Chúc quý khách có một trải nghiệm tuyệt vời tại nhà hàng của chúng tôi!</p>
            </div>`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Restaurant" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: "📩 Xác nhận đặt bàn tại nhà hàng của chúng tôi",
            html: mailContent
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email đã gửi thành công!");

    } catch (error) {
        console.error("❌ Lỗi khi gửi email:", error);
    }
}

/**
 * 📌 Lấy danh sách bàn có sẵn theo ngày & giờ 
 */
exports.getAvailableTables = async (req, res) => {
    try {
        const { bookingDate, startTime } = req.query;

        if (!bookingDate || !startTime) {
            return res.status(400).json({ message: "Vui lòng cung cấp ngày và giờ!" });
        }

        // ✅ Chuyển đổi `bookingDate` và `startTime` sang UTC
        const formattedBookingDate = new Date(`${bookingDate}T00:00:00.000Z`);
        const [bookingHour, bookingMinute] = startTime.split(":").map(Number);
        const requestedStart = new Date(formattedBookingDate);
        requestedStart.setUTCHours(bookingHour, bookingMinute, 0, 0);

        const requestedEnd = new Date(requestedStart.getTime() + 5 * 60 * 60 * 1000); // +5 tiếng

        console.log(`🔍 Kiểm tra từ ${requestedStart} đến ${requestedEnd}`);

        // ✅ Lấy tất cả bàn từ DB
        const tables = await Table.find();

        // ✅ Lấy tất cả booking trong ngày
        const bookings = await Booking.find({ bookingDate: formattedBookingDate });

        // ✅ Kiểm tra trạng thái từng bàn
        const availableTables = tables.map((table) => {
            const relatedBookings = bookings.filter(
                (booking) => booking.tableId.toString() === table._id.toString()
            );

            let isAvailable = true;

            for (const booking of relatedBookings) {
                const bookingStart = new Date(booking.bookingDate);
                const [bookedHour, bookedMinute] = booking.startTime.split(":").map(Number);
                bookingStart.setUTCHours(bookedHour, bookedMinute, 0, 0);

                const bookingEnd = new Date(bookingStart.getTime() + 5 * 60 * 60 * 1000);

                if (
                    (requestedStart >= bookingStart && requestedStart < bookingEnd) || // Chồng giờ bắt đầu
                    (requestedEnd > bookingStart && requestedEnd <= bookingEnd) || // Chồng giờ kết thúc
                    (requestedStart <= bookingStart && requestedEnd >= bookingEnd) // Bao toàn bộ
                ) {
                    isAvailable = false;
                    break;
                }
            }

            return {
                ...table.toObject(),
                isAvailable,
                status: isAvailable ? "available" : "reserved",
            };
        });

        res.status(200).json(availableTables);
    } catch (error) {
        console.error("🚨 Lỗi khi lấy danh sách bàn:", error.message);
        res.status(500).json({ message: "Lỗi khi lấy danh sách bàn!", error: error.message });
    }
};


/**
 * 📌 Kiểm tra bàn có thể đặt không 
 */
exports.checkTableAvailability = async (req, res) => {
    try {
        const { tableId, bookingDate, startTime } = req.body;

        console.log("🟢 Nhận Request Kiểm Tra Bàn:", req.body);

        if (!tableId || !bookingDate || !startTime) {
            return res.status(400).json({ message: "Thiếu thông tin kiểm tra bàn!" });
        }

        // ✅ Kiểm tra xem bàn có tồn tại không
        const table = await Table.findById(tableId);
        if (!table) {
            console.log("❌ Bàn không tồn tại:", tableId);
            return res.status(404).json({ message: "Bàn không tồn tại!" });
        }
        console.log("📌 Thông tin bàn:", table);

        // ✅ Chuẩn hóa `bookingDate` về dạng `UTC`
        const parsedDate = new Date(bookingDate);
        const formattedBookingDate = new Date(parsedDate.toISOString().split("T")[0]);
        formattedBookingDate.setUTCHours(0, 0, 0, 0);

        if (isNaN(formattedBookingDate.getTime())) {
            return res.status(400).json({ message: "Ngày đặt bàn không hợp lệ!" });
        }
        console.log("📌 `bookingDate` sau khi xử lý:", formattedBookingDate.toISOString());

        // ✅ Xử lý thời gian đặt bàn
        const bookingStart = new Date(formattedBookingDate);
        const [bookingHour, bookingMinute] = startTime.split(":").map(Number);
        bookingStart.setUTCHours(bookingHour, bookingMinute, 0, 0);
        const bookingEnd = new Date(bookingStart.getTime() + 5 * 60 * 60 * 1000); // +5 tiếng

        console.log("⏰ Thời Gian Đặt Bàn Sau Khi Xử Lý:", bookingStart.toISOString(), "→", bookingEnd.toISOString());

        if (isNaN(bookingStart.getTime())) {
            return res.status(400).json({ message: "Thời gian đặt bàn không hợp lệ!" });
        }

        // ✅ **Lấy tất cả đơn đặt bàn của bàn đó trong ngày**
        const existingBookings = await Booking.find({
            tableId: tableId,
            bookingDate: formattedBookingDate
        });

        console.log("📌 Đơn đặt bàn trong ngày:", existingBookings);

        // ✅ **Kiểm tra trùng lịch đặt bàn**
        for (let booking of existingBookings) {
            let existingStart = new Date(booking.bookingDate);
            let [existingHour, existingMinute] = booking.startTime.split(":").map(Number);
            existingStart.setUTCHours(existingHour, existingMinute, 0, 0);
            let existingEnd = new Date(existingStart.getTime() + 5 * 60 * 60 * 1000); // +5 tiếng

            console.log(`🔍 So sánh với Booking trước: ${existingStart.toISOString()} - ${existingEnd.toISOString()}`);

            if (
                (bookingStart >= existingStart && bookingStart < existingEnd) || // Giờ bắt đầu nằm trong khoảng
                (bookingEnd > existingStart && bookingEnd <= existingEnd) || // Giờ kết thúc nằm trong khoảng
                (bookingStart <= existingStart && bookingEnd >= existingEnd) // Booking mới bao trùm booking cũ
            ) {
                console.log("❌ Bàn đã bị đặt trong khoảng thời gian này!");
                return res.status(400).json({ message: "Bàn này đã bị đặt, vui lòng chọn giờ khác!" });
            }
        }

        console.log("✅ Bàn có thể đặt!");
        res.status(200).json({
            message: "Bàn có thể đặt!",
            isAvailable: true
        });

    } catch (error) {
        console.error("🚨 Lỗi trong checkTableAvailability:", error.message);
        res.status(500).json({ message: "Lỗi khi kiểm tra bàn!", error: error.message });
    }
};

/**
 * 📌 API Lấy danh sách món ăn
 */
// http://localhost:3000/bookings/get-dishes?category=Món nước
// http://localhost:3000/bookings/get-dishes?isAvailable=true
// http://localhost:3000/bookings/get-dishes?page=2&limit=5       Áp dụng phân trang (page=2&limit=5)

exports.getDishes = async (req, res) => {
    try {
        const { category, isAvailable, page = 1, limit = 10 } = req.query;

        // ✅ Xây dựng bộ lọc động (nếu có category hoặc trạng thái)
        let filter = {};
        if (category) filter.category = category;
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

        // ✅ Áp dụng phân trang
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalDishes = await Dish.countDocuments(filter);
        const dishes = await Dish.find(filter).skip(skip).limit(parseInt(limit));

        res.status(200).json({
            success: true,
            total: totalDishes,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalDishes / parseInt(limit)),
            data: dishes
        });

    } catch (error) {
        console.error("🚨 Lỗi khi lấy danh sách món ăn:", error.message);
        res.status(500).json({ message: "Lỗi khi lấy danh sách món ăn!", error: error.message });
    }
};

/**
 * 📌 API Lưu món ăn vào đơn đặt bàn 
 */
exports.addDishesToBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { dishes } = req.body;

        console.log("🟢 Nhận yêu cầu thêm món vào đơn:", { bookingId, dishes });

        // ✅ Kiểm tra đơn đặt bàn có tồn tại không
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
        }

        // ✅ Xử lý danh sách món ăn
        const bookingDishes = [];
        for (const dish of dishes) {
            console.log("📌 Kiểm tra món ăn:", dish);

            const dishExists = await Dish.findById(dish.dishId);
            if (!dishExists) {
                console.log(`⚠️ Món ăn không tồn tại: ${dish.dishId}`);
                continue; // Bỏ qua món ăn không hợp lệ
            }

            // ✅ Nếu `quantity > 0`, giữ món ăn trong đơn
            if (dish.quantity > 0) {
                bookingDishes.push({
                    bookingId,
                    dishId: dish.dishId.toString(),
                    quantity: dish.quantity,
                });
            }
        }

        console.log("📌 Danh sách món ăn hợp lệ sau khi xử lý:", bookingDishes);

        // ✅ Xóa danh sách món ăn cũ trước khi cập nhật (để tránh trùng lặp)
        await BookingDish.deleteMany({ bookingId });

        // ✅ Lưu món ăn mới vào `BookingDish`
        if (bookingDishes.length > 0) {
            await BookingDish.insertMany(bookingDishes);
            console.log("✅ Dishes đã lưu vào BookingDish!");
        } else {
            console.log("⚠️ Không có món ăn hợp lệ nào để lưu!");
        }

        // ✅ Cập nhật danh sách món ăn trong `Booking`
        booking.bookingDishes = bookingDishes.map(dish => dish.dishId.toString());
        await booking.save();

        console.log("✅ Món ăn đã cập nhật vào đơn Booking:", booking.bookingDishes);

        // ✅ Trả về thông tin đầy đủ của món ăn
        const updatedDishes = await BookingDish.find({ bookingId })
            .populate("dishId") // Lấy thông tin từ bảng `Dish`
            .lean();

        res.status(200).json({
            message: "Món ăn đã được cập nhật vào đơn!",
            dishes: updatedDishes.map(dish => ({
                dishId: dish.dishId._id,
                name: dish.dishId.name,
                price: dish.dishId.price,
                category: dish.dishId.category,
                isAvailable: dish.dishId.isAvailable,
                quantity: dish.quantity
            }))
        });


    } catch (error) {
        console.error("🚨 Lỗi khi thêm món vào đơn:", error.message);
        res.status(500).json({ message: "Lỗi khi thêm món ăn vào đơn!", error: error.message });
    }
};


/**
 * 📌 API cập nhật ghi chú trong đơn hàng 
 */
exports.updateNote = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { notes } = req.body;

        console.log("🟢 Nhận yêu cầu cập nhật ghi chú:", { bookingId, notes });

        // ✅ Kiểm tra `bookingId` có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Mã đơn hàng không hợp lệ!" });
        }

        // ✅ Kiểm tra `notes` có hợp lệ không
        if (!notes || typeof notes !== "string" || !notes.trim()) {
            return res.status(400).json({ message: "Ghi chú không được để trống!" });
        }

        // ✅ Cập nhật ghi chú
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { notes },
            { new: true, runValidators: true } // Trả về dữ liệu mới sau khi update
        ).lean();

        if (!updatedBooking) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
        }

        console.log("✅ Ghi chú đã được cập nhật:", updatedBooking.notes);

        res.status(200).json({
            message: "Ghi chú đã được cập nhật!",
            booking: {
                bookingId: updatedBooking._id,
                notes: updatedBooking.notes
            }
        });

    } catch (error) {
        console.error("🚨 Lỗi khi cập nhật ghi chú:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật ghi chú!", error: error.message });
    }
};

