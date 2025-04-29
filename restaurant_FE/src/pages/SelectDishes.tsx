import React, { useState, useEffect } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import styles from "../css/SelectDishes.module.css";
import Cookies from "js-cookie";

interface Dish {
    dishId: string;
    quantity: number;
}

const SelectDishes = ({ bookingId, onOrderTypeChange, openAddNoteModal }) => {
    const [dishes, setDishes] = useState([]);
    const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]);
    const [orderType, setOrderType] = useState("order-at-restaurant");
    const [showOrderTypeModal, setShowOrderTypeModal] = useState(true);
    const [showDishModal, setShowDishModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);


    // const navigate = useNavigate();
    const effectiveBookingId = bookingId || Cookies.get("bookingId");

    useEffect(() => {
        console.log("📌 Booking ID:", effectiveBookingId);
    }, [effectiveBookingId]);

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                const response = await axios.get("http://localhost:3000/bookings/get-dishes");
                setDishes(response.data.data);
            } catch (error) {
                setErrorMessage("Error retrieving dish list.");
            }
        };

        const fetchBookingDetails = async () => {
            if (!effectiveBookingId) return;
            try {
                const response = await axios.get(`http://localhost:3000/bookings/${effectiveBookingId}`);
                const bookingData = response.data;
                setSelectedDishes(bookingData.dishes || []);
                setOrderType(bookingData.orderType || "order-at-restaurant");
            } catch (error) {
                setSelectedDishes([]);
                setOrderType("order-at-restaurant");
            }
        };

        fetchDishes();
        if (effectiveBookingId) fetchBookingDetails();
    }, [effectiveBookingId]);

    const handleQuantityChange = (dishId: string, change: number) => {
        setSelectedDishes((prev: Dish[]) => {
            const existingDish = prev.find(dish => dish.dishId === dishId);

            if (existingDish) {
                return prev.map(dish =>
                    dish.dishId === dishId
                        ? { ...dish, quantity: Math.max(0, dish.quantity + change) }
                        : dish
                ).filter(dish => dish.quantity > 0);
            } else if (change > 0) {
                return [...prev, { dishId, quantity: 1 }]; // ✅ Thêm món mới
            }

            return prev;
        });
    };


    const handleRemoveDish = (dishId) => {
        setSelectedDishes(prev => prev.filter(dish => dish.dishId !== dishId));
    };

    const handleSubmit = async () => {
        if (!effectiveBookingId) {
            setErrorMessage("Error: Booking ID not found!");
            return;
        }
        try {
            const formattedDishes = selectedDishes.map(dish => ({
                dishId: dish.dishId,
                quantity: dish.quantity
            }));

            await axios.put(`http://localhost:3000/bookings/${effectiveBookingId}/add-dishes`, {
                dishes: orderType === "pre-order" ? formattedDishes : [],
                orderType
            });

            openAddNoteModal();
        } catch (error) {
            setErrorMessage("Error sending data to the server. Please try again!");
        }
    };

    return (
        <div className={styles.container}>
            {showOrderTypeModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalHeader}>Choose ordering method</h2>
                        <div className={styles.modalBody}>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    value="pre-order"
                                    checked={orderType === "pre-order"}
                                    onChange={() => {
                                        setOrderType("pre-order");
                                        setShowDishModal(true); // Hiển thị danh sách món
                                        setShowOrderTypeModal(false);
                                    }}
                                />
                                <span>Pre-order</span>
                            </label>

                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    value="order-at-restaurant"
                                    checked={orderType === "order-at-restaurant"}
                                    onChange={() => {
                                        setOrderType("order-at-restaurant");
                                        if (typeof onOrderTypeChange === "function") {
                                            onOrderTypeChange("order-at-restaurant");
                                        }
                                        setShowConfirmModal(true); // Hiển thị modal xác nhận
                                    }}
                                />
                                <span>Order at the restaurant</span>
                            </label>

                            {showConfirmModal && (
                                <div className={styles.modalOverlay}>
                                    <div className={styles.modalContent}>
                                        <h2 className={styles.modalHeader}>Confirmation</h2>
                                        <p className={styles.modalBody}>Are you sure you want to continue without pre-ordering?</p>
                                        <div className={styles.modalFooter}>
                                            <button
                                                onClick={() => {
                                                    setOrderType("order-at-restaurant");
                                                    setShowOrderTypeModal(false); // Đóng modal chọn cách đặt món
                                                    setShowConfirmModal(false); // Đóng modal xác nhận
                                                    if (typeof onOrderTypeChange === "function") {
                                                        onOrderTypeChange("order-at-restaurant");
                                                    }
                                                    openAddNoteModal(); // ✅ Thay vì navigate, mở modal AddNote
                                                }}

                                                className={styles.confirmButton}
                                            >
                                                Confirm
                                            </button>

                                            <button
                                                onClick={() => setShowConfirmModal(false)}
                                                className={styles.cancelButton}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            )}

            {
                showDishModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalHeader}>Select dishes</h2>
                            <div className={styles.modalBody}>
                                <ul className={styles.dishList}>
                                    {dishes.map((dish) => (
                                        <li key={dish._id} className={styles.dishItem}>
                                            <div className={styles.flexCenter}>

                                                <img
                                                    src={dish.imageUrl || "https://cdn.tgdd.vn/Files/2020/10/27/1302333/omakase-la-gi-tai-sao-nguoi-nhat-san-sang-chi-tien-cho-loai-hinh-am-thuc-cau-ky-nay-202010271035082405.jpg"}
                                                    alt={dish.name}
                                                    className={styles.dishImage}
                                                />
                                                <div>
                                                    <h4>{dish.name}</h4>
                                                    <p>Price: {dish.price.toLocaleString()} VND</p>
                                                </div>
                                            </div>
                                            <div className={styles.flexCenter}>
                                                <div className={styles.quantityControl}>
                                                    <button className={styles.quantityButton}
                                                        onClick={() => handleQuantityChange(dish._id, -1)}>-</button>
                                                    <span>
                                                        {selectedDishes.find((item) => item.dishId === dish._id)?.quantity || 0}
                                                    </span>
                                                    <button className={styles.quantityButton} onClick={() => handleQuantityChange(dish._id, 1)}>+</button>
                                                </div>
                                                {/* <button
                                                onClick={() => handleRemoveDish(dish._id)}
                                                className={styles.removeButton}
                                            >
                                                x
                                            </button> */}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.modalFooter}>
                                <button onClick={handleSubmit} className={styles.confirmButton}>Confirm</button>
                                <button onClick={() => {
                                    setShowDishModal(false);
                                    setShowOrderTypeModal(true); // Quay lại chọn cách đặt món
                                }} className={styles.cancelButton}>Close</button>

                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default SelectDishes;
