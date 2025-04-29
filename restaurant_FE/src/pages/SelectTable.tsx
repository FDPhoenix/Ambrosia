import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import styles from "../css/SelectTable.module.css";
import Cookies from "js-cookie";

const SelectTable = ({
    selectedDate,
    selectedTime,
    onBookingSuccess,
    onTableSelected, // 🟢 Thay vì mở SelectDishes ở đây, ta gọi hàm này để mở modal từ HomePage
    onBack,
}: {
    selectedDate: string;
    selectedTime: string;
    onBookingSuccess: (bookingId: string) => void;
    onTableSelected: () => void;
    onBack: () => void;
}) => {
    const [availableTables, setAvailableTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [newBookingId, setNewBookingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // ✅ Thêm state loading

    const navigate = useNavigate();

    // Lấy thông tin khách hàng từ Redux
    const bookingInfo = useSelector((state: RootState) => state.booking);

    useEffect(() => {
        if (!selectedDate || !selectedTime) return;

        const fetchAvailableTables = async () => {
            setIsLoading(true); // ✅ Bắt đầu loading
            try {
                const response = await axios.get("http://localhost:3000/bookings/available-tables", {
                    params: { bookingDate: selectedDate, startTime: selectedTime },
                });
                setAvailableTables(response.data);
            } catch (error) {
                setErrorMessage("Error retrieving table list!");
            } finally {
                setIsLoading(false); // ✅ API gọi xong, dừng loading
            }
        };

        fetchAvailableTables();
    }, [selectedDate, selectedTime]);

    const handleSelectTable = (table) => {
        if (!table.isAvailable) return;
        setSelectedTable(table._id);
    };

    const handleBookTable = async () => {
        if (!selectedTable) {
            alert("Please select a table first!!");
            return;
        }

        const token = Cookies.get("token"); // ✅ Chỉ cần gửi token, backend sẽ tự lấy userId

        try {
            const response = await axios.post(
                "http://localhost:3000/bookings",
                {
                    tableId: selectedTable,
                    bookingDate: selectedDate,
                    startTime: selectedTime,
                    orderType: "dine-in",
                    name: bookingInfo.name,
                    phone: bookingInfo.phone,
                    email: bookingInfo.email,
                    contactPhone: bookingInfo.contactPhone || bookingInfo.phone,
                    notes: "",
                    dishes: []
                },
                {
                    headers: { Authorization: token ? `Bearer ${token}` : "" } // ✅ Chỉ cần gửi token, backend tự lấy userId
                }
            );

            console.log("✅ Booking created successfully:", response.data);
            const newBookingId = response.data.bookingId;

            if (!newBookingId) {
                setErrorMessage("API did not return a bookingId! Check backend.");
                return;
            }

            Cookies.set("bookingId", newBookingId);

            if (typeof onBookingSuccess === "function") {
                onBookingSuccess(newBookingId);
            }

            setNewBookingId(newBookingId);
            setShowSuccessModal(true);

        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Unknown error!");
        }
    };


    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalHeader}>Book a table</h2>
                {errorMessage && <p className="error" style={{ color: "red" }}>{errorMessage}</p>}

                {isLoading ? (
                    <p className={styles.loadingMessage}>⏳ Loading tables...</p> // ✅ Hiển thị khi API đang gọi
                ) : availableTables.length > 0 ? (
                    <ul className={styles.tableList}>
                        {availableTables.map((table) => (
                            <li
                                key={table._id}
                                onClick={() => handleSelectTable(table)}
                                style={{
                                    cursor: table.isAvailable ? "pointer" : "not-allowed",
                                    background: selectedTable === table._id ? "lightgreen" : table.isAvailable ? "white" : "lightgray",
                                    padding: "10px",
                                    margin: "5px",
                                    border: "1px solid black",
                                    opacity: table.isAvailable ? 1 : 0.5,
                                }}
                            >
                                Table {table.tableNumber} - {table.isAvailable ? "✅ Available" : "❌ Reserved"}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noTableMessage}>⚠️ No available tables for this time slot!</p> // ✅ Chỉ hiển thị sau khi API hoàn tất
                )}


                {showSuccessModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalHeader}>Booking Successful</h2>
                            <p className={styles.modalBody}>Table booking successful!</p>
                            <div className={styles.modalFooter}>
                                <button
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        onTableSelected(); // 🟢 Thay vì render SelectDishes, ta gọi hàm này để mở modal từ HomePage
                                    }}
                                    className={styles.continueButton}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                <div className={styles.buttonGroup}>
                    <button onClick={handleBookTable} disabled={!selectedTable} className={styles.confirmButton}>
                        Confirm table booking
                    </button>
                    <button
                        onClick={() => {
                            if (typeof onBack === "function") {
                                console.log("🔄 Going back to SelectDateTime"); // Debug log
                                onBack(); // 🔥 Gọi hàm onBack để quay lại chọn ngày/giờ
                            } else {
                                console.error("❌ Error: onBack is not a function!", onBack);
                            }
                        }}
                        className={styles.backButton}
                    >
                        Re-select booking date
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectTable;
