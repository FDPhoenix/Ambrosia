import axios from "axios";
import Cookies from "js-cookie";

export const createBooking = async (bookingData: any) => {
    try {
        const token = Cookies.get("token");
        console.log("🔹 Token gửi lên:", token);

        const response = await axios.post("http://localhost:3000/bookings", bookingData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        console.log("✅ API createBooking response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Lỗi khi tạo booking:", error.response?.data || error.message);
        throw error.response?.data || { message: "Lỗi không xác định" };
    }
};


export const checkTableAvailability = async (tableId: string, bookingDate: string, startTime: string) => {
    try {
        const response = await axios.post("http://localhost:3000/bookings/check-table", {
            tableId,
            bookingDate,
            startTime
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: "Lỗi không xác định" };
    }
};

export const getAvailableTables = async (bookingDate: string, startTime: string) => {
    try {
        const response = await axios.post("http://localhost:3000/bookings/available-tables", {
            bookingDate,
            startTime,
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: "Lỗi không xác định" };
    }
};
