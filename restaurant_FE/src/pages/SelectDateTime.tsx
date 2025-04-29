import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import SelectTable from "./SelectTable";
import styles from "../css/SelectDateTime.module.css";
import axios from "axios";
import { setBookingInfo } from "../redux/bookingSlice";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // ✅ Import thư viện js-cookie

const SelectDateTime = ({
    onBookingSuccess,
    openBookingModal,
    openSelectDishesModal,
    closeModal
}: {
    onBookingSuccess: (bookingInfo: unknown) => void,
    openBookingModal: () => void,
    openSelectDishesModal: () => void,
    closeModal: () => void
}) => {

    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Lấy thông tin khách hàng từ Redux
    const bookingInfo = useSelector((state: RootState) => state.booking);

    // ✅ Gọi API `getProfile` khi modal mở nếu chưa có thông tin user
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = Cookies.get("token");
            if (!token) {
                console.warn("⚠️ Không tìm thấy token trong Cookies");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get("http://localhost:3000/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true, // ✅ Đảm bảo gửi Cookies trong request
                });

                console.log("🔹 API trả về user:", response.data.user);
                dispatch(setBookingInfo({
                    userId: response.data.user.userId,
                    name: response.data.user.fullname,
                    email: response.data.user.email,
                    phone: response.data.user.phoneNumber,
                }));

            } catch (error) {
                console.error("❌ Lỗi lấy thông tin user:", error);
                setError("Không thể lấy thông tin user");
            } finally {
                setLoading(false);
            }
        };


        fetchUserProfile();
    }, [dispatch]);

    const handleConfirm = () => {
        // Kiểm tra xem thông tin khách hàng đã đầy đủ chưa
        if (!bookingInfo.name || !bookingInfo.phone || !bookingInfo.email) {
            setError("Please enter your full name, email, and phone number!");
            return;
        }

        if (!selectedDate || !selectedTime) {
            setError("Please select a valid date and time!");
            return;
        }

        setConfirmed(true);
        setShowTableModal(true);
        setError("");
    };

    const handleTableSelection = () => {
        setShowTableModal(false); // Đóng modal chọn bàn
        openSelectDishesModal();  // Mở modal chọn món
    };


    return (
        <div className={styles.modalOverlay} >
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={closeModal}>
                    ✖
                </button>
                <h2 className={styles.modalHeader}> Select Date & Time</h2>
                {loading ? <p>Loading user info...</p> : error ? <p className={styles.errorText}>{error}</p> : null}

                {error && <p className={styles.errorText}>{error}</p>}

                <div className={styles.formGroup}>
                    <label>Date :</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]} // Không cho chọn ngày quá khứ
                        className={styles.input}
                    />
                </div>

                < div className={styles.formGroup} >
                    <label>Time :</label>
                    <select className={styles.input} value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                        <option value="" disabled>Select Time</option>
                        {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                < div className={styles.buttonGroup} >
                    <button onClick={handleConfirm} className={styles.confirmButton}>Confirm</button>
                </div>

                {showTableModal && (
                    <SelectTable
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onBookingSuccess={onBookingSuccess}
                        onTableSelected={handleTableSelection} // Khi chọn bàn xong, chuyển sang SelectDishes
                        onBack={() => {
                            console.log("🔄 Back to SelectDateTime from SelectTable"); // Debug log
                            setShowTableModal(false); // Đóng modal chọn bàn
                        }} // 🔥 Truyền onBack để quay lại SelectDateTime
                    />
                )}

            </div>
        </div>
    );
};

export default SelectDateTime;