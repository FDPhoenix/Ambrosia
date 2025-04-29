const Order = require("../models/Order");
const ExcelJS = require("exceljs");
const BookingDish = require('../models/BookingDish');

exports.getRevenue = async (req, res) => {
    try {
        let { year, month, day } = req.query;

        const today = new Date();
        year = year ? parseInt(year) : today.getFullYear();
        month = month ? parseInt(month) : today.getMonth() + 1;
        day = day ? parseInt(day) : null;

        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({ message: "Invalid year or month" });
        }

        if (day && (isNaN(day) || day < 1 || day > 31)) {
            return res.status(400).json({ message: "Invalid day" });
        }

        // Lấy theo ngày cụ thể
        if (day) {
            const startDate = new Date(year, month - 1, day, 0, 0, 0);
            const endDate = new Date(year, month - 1, day, 23, 59, 59);

            const revenue = await Order.aggregate([
                {
                    $match: {
                        paymentStatus: "Success", // Sửa lại paymentStatus
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" },
                    },
                },
            ]);

            return res.json({
                year,
                month,
                day,
                revenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
            });
        }
        // Lấy theo tháng
        else {
            const startDate = new Date(year, month - 1, 1, 0, 0, 0);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const revenueByDay = await Order.aggregate([
                {
                    $match: {
                        paymentStatus: "Success", // Đảm bảo lấy dữ liệu đúng trạng thái
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: { $dayOfMonth: "$createdAt" },
                        revenue: { $sum: "$totalAmount" },
                    },
                },
                {
                    $sort: { "_id": 1 },
                },
            ]);

            const revenueList = revenueByDay.map(item => ({
                day: item._id,
                revenue: item.revenue,
            }));

            const totalRevenue = revenueByDay.reduce((sum, item) => sum + item.revenue, 0);

            return res.json({
                year,
                month,
                revenueList,
                totalRevenue
            });
        }
    } catch (error) {
        console.error("🔥 Error in getRevenue:", error);
        res.status(500).json({ message: "Error retrieving revenue statistics", error: error.message });
    }
};

exports.getOrdersByDate = async (req, res) => {
    try {
        const { year, month, day } = req.params;
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

        const orders = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate },
            paymentStatus: "Success",
        }).populate("userId").populate("bookingId");

        res.json({ date: `${day}/${month}/${year}`, orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error retrieving order list", error: error.message });
    }
};

exports.exportRevenueReport = async (req, res) => {
    try {
        let { year, month } = req.query;
        year = parseInt(year);
        month = parseInt(month);

        if (!year || !month || month < 1 || month > 12) {
            return res.status(400).json({ message: "Invalid year or month" });
        }

        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

        // Truy vấn MongoDB lấy dữ liệu doanh thu theo ngày
        const revenueData = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "Success",
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%d/%m/%Y", date: "$createdAt" } },
                    },
                    revenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                },
            },
            { $sort: { "_id.date": 1 } },
        ]);

        // Tạo danh sách đầy đủ ngày trong tháng
        const daysInMonth = new Date(year, month, 0).getDate();
        const completeData = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
            const existingData = revenueData.find((item) => item._id.date === dateStr);
            completeData.push({
                day: dateStr,
                totalOrders: existingData ? existingData.totalOrders : 0,
                revenue: existingData ? existingData.revenue : 0,
            });
        }

        // Tạo file Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Revenue_${month}_${year}`);

        worksheet.columns = [
            { header: "Day", key: "day", width: 15 },
            { header: "Total Orders", key: "totalOrders", width: 15 },
            { header: "Revenue (VND)", key: "revenue", width: 20 },
        ];

        completeData.forEach((item) => {
            worksheet.addRow(item);
        });

        // Xuất file
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=Revenue_${month}_${year}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error exporting report:", error);
        res.status(500).json({ message: "Error exporting revenue report", error: error.message });
    }
};

exports.getBillDetails = async (req, res) => { 
    try {
        const { id } = req.params;
        
        const order = await Order.findById(id)
            .populate({
                path: "bookingId",
                select: "orderType bookingDate status tableId",
                populate: { // Populate thêm thông tin Table
                    path: "tableId",
                    model: "Table",
                    select: "tableNumber capacity"
                }
            })
            .populate({
                path: "userId",
                select: "fullname",
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng!",
            });
        }
        if (!order.bookingId) {
            return res.status(400).json({
                success: false,
                message: "Đơn hàng không có bookingId!",
            });
        }
        
        const items = await BookingDish.find({ bookingId: order.bookingId._id })
            .populate({
                path: "dishId",
                select: "name price imageUrl",
            });

        // Tính tổng tiền dựa trên số lượng (giả sử BookingDish có quantity)
        const data = {
            ...order.toObject(),
            items: items.map(item => ({
                ...item.toObject(),
                totalPrice: (item.quantity || 1) * item.dishId.price // Nếu không có quantity, mặc định là 1
            })),
        };

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Lỗi lấy thông tin đơn hàng:", error); 
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy đơn hàng!",
            error: error.message,
        });
    }
}

exports.printBill = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate({
                path: "bookingId",
                select: "orderType bookingDate status tableId",
                populate: { // Populate thêm thông tin Table
                    path: "tableId",
                    model: "Table",
                    select: "tableNumber capacity"
                }
            })
            .populate({
                path: "userId",
                select: "fullname",
            });

        if (!order) {
            return res.status(404).send("<h3>Không tìm thấy đơn hàng!</h3>");
        }

        if (!order.bookingId) {
            return res.status(400).send("<h3>Đơn hàng không có bookingId!</h3>");
        }

        const items = await BookingDish.find({ bookingId: order.bookingId._id })
            .populate({
                path: "dishId",
                select: "name price imageUrl",
            });

        let totalAmount = 0;
        let itemRows = items.map((item, index) => {
            const quantity = item.quantity || 1; // Nếu không có quantity, mặc định là 1
            const itemTotal = quantity * item.dishId.price;
            totalAmount += itemTotal;
            return `<tr>
                        <td>${index + 1}</td>
                        <td>${item.dishId.name}</td>
                        <td>${quantity}</td>
                        <td>${item.dishId.price.toLocaleString()} VND</td>
                        <td>${itemTotal.toLocaleString()} VND</td>
                    </tr>`;
        }).join("");

        const billHtml = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid black; padding: 5px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .info-section { margin-bottom: 20px; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>Hóa Đơn</h2>
                <div class="info-section">
                    <p><span class="label">Khách hàng:</span> ${order.userId.fullname}</p>
                    <p><span class="label">Ngày đặt:</span> ${new Date(order.bookingId.bookingDate).toLocaleString()}</p>
                    <p><span class="label">Loại đơn hàng:</span> ${order.bookingId.orderType}</p>
                    <p><span class="label">Trạng thái:</span> ${order.bookingId.status}</p>
                    <p><span class="label">Mã đơn hàng:</span> ${order._id}</p>
                    ${order.bookingId.tableId ? `<p><span class="label">Số bàn:</span> ${order.bookingId.tableId.tableNumber} (Sức chứa: ${order.bookingId.tableId.capacity})</p>` : ""}
                    <p><span class="label">Số tiền đã trả trước:</span> ${order.prepaidAmount.toLocaleString()} VND</p>
                    <p><span class="label">Phương thức thanh toán:</span> ${order.paymentMethod || "Chưa xác định"}</p>
                    <p><span class="label">Trạng thái thanh toán:</span> ${order.paymentStatus || "Chưa xác định"}</p>
                    <p><span class="label">Ngày tạo đơn:</span> ${new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <table>
                    <tr>
                        <th>#</th>
                        <th>Món</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                    ${itemRows}
                    <tr>
                        <td colspan="4"><strong>Tổng tiền</strong></td>
                        <td><strong>${totalAmount.toLocaleString()} VND</strong></td>
                    </tr>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>`;

        res.send(billHtml);
    } catch (error) {
        console.error("Lỗi in hóa đơn:", error);
        res.status(500).send("<h3>Lỗi khi in hóa đơn!</h3>");
    }
};