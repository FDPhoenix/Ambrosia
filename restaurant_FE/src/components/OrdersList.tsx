import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../css/OrdersList.module.css";

// Định nghĩa interface cho dữ liệu
interface User {
    _id: string;
    fullname: string;
}

interface Table {
    _id: string;
    tableNumber: string;
    capacity: number;
}

interface Booking {
    _id: string;
    tableId?: Table;
    orderType: string;
    bookingDate: string;
    status: string;
}

interface Dish {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
}

interface Item {
    _id: string;
    bookingId: string;
    dishId: Dish;
    quantity: number;
}

interface Order {
    _id: string;
    userId?: User;
    bookingId?: Booking;
    totalAmount: number;
    prepaidAmount: number;
    paymentMethod?: string;
    paymentStatus?: string;
    createdAt: string;
    items?: Item[];
}

interface OrdersListProps {
    year: number;
    month: number;
    day: number;
    goBack: () => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ year, month, day, goBack }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [printing, setPrinting] = useState<boolean>(false);

    useEffect(() => {
        fetchOrders();
    }, [year, month, day]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get<{ orders: Order[] }>(
                `http://localhost:3000/api/revenue/${year}/${month}/${day}`
            );
            setOrders(response.data.orders);
        } catch (error) {
            console.error("Error fetching order list:", error);
        }
        setLoading(false);
    };

    const fetchOrderDetail = async (orderId: string) => {
        try {
            const response = await axios.get<{ data: Order }>(
                `http://localhost:3000/api/revenue/order/${orderId}`
            );
            setSelectedOrder(response.data.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    };

    const handlePrintInvoice = async () => {
        if (!selectedOrder) return;

        setPrinting(true);
        try {
            const response = await axios.get(
                `http://localhost:3000/api/revenue/printBill/${selectedOrder._id}`,
                { responseType: "text" }
            );

            const printWindow = window.open("", "_blank");
            printWindow?.document.open();
            printWindow?.document.write(response.data);
            printWindow?.document.close();
        } catch (error) {
            console.error("Error printing invoice:", error);
            alert("Lỗi khi in hóa đơn!");
        } finally {
            setPrinting(false);
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={goBack}>Back</button>
            <h2 className={styles.title}>Orders List for {day}/{month}/{year}</h2>
            
            {loading ? (
                <p>Loading data...</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Order Date</th>
                            <th>Total Amount</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.userId?.fullname || "No Name"}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                                <td>{order.totalAmount.toLocaleString()} VND</td>
                                <td>
                                    <button
                                        className={styles.detailButton}
                                        onClick={() => fetchOrderDetail(order._id)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {isModalOpen && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} ${styles.scrollable}`}>
                        <button
                            className={styles.closeIcon}
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✖
                        </button>
                        <h2 className={styles.invoiceTitle}>🧾 Payment Invoice</h2>

                        <div className={styles.invoiceInfo}>
                            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                            <p><strong>Customer:</strong> {selectedOrder.userId?.fullname || "No Name"}</p>
                            <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            {selectedOrder.bookingId && (
                                <>
                                    <p><strong>Booking Date:</strong> {new Date(selectedOrder.bookingId.bookingDate).toLocaleString()}</p>
                                    <p><strong>Order Type:</strong> {selectedOrder.bookingId.orderType}</p>
                                    <p><strong>Status:</strong> {selectedOrder.bookingId.status}</p>
                                    {selectedOrder.bookingId.tableId && (
                                        <p><strong>Table:</strong> {selectedOrder.bookingId.tableId.tableNumber} (Capacity: {selectedOrder.bookingId.tableId.capacity})</p>
                                    )}
                                </>
                            )}
                            <p><strong>Prepaid Amount:</strong> {selectedOrder.prepaidAmount.toLocaleString()} VND</p>
                            <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
                            <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || "N/A"}</p>
                        </div>

                        <h3 className={styles.subTitle}>Order Details</h3>
                        <table className={styles.invoiceTable}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Dish</th>
                                    <th>Quantity</th>
                                    <th>Unit Price (VND)</th>
                                    <th>Subtotal (VND)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.items?.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{item.dishId.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.dishId.price.toLocaleString()}</td>
                                        <td>{(item.quantity * item.dishId.price).toLocaleString()} VND</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h3 className={styles.totalAmount}>
                            Total: <span>{selectedOrder.totalAmount.toLocaleString()} VND</span>
                        </h3>

                        <button
                            className={styles.printButton}
                            onClick={handlePrintInvoice}
                            disabled={printing}
                        >
                            {printing ? "Printing..." : "Print Invoice"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersList;