import { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import styles from '../../css/AdminCss/OrderContent.module.css'

interface User {
  _id: string;
  email: string;
}

interface Order {
  _id: string;
  userId?: User | null;
  totalAmount: number;
  prepaidAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  remainingAmount?: number;
  createdAt: string;
}

function OrderContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchOrders = async (status: string) => {
    try {
      let url = `http://localhost:3000/orders`;

      if (status) {
        url += `?paymentStatus=${encodeURIComponent(status)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders(paymentStatus);
  }, [paymentStatus]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`);
      const data = await response.json();

      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setIsModalOpen(true);
      } else {
        console.error("Error fetching order details:", data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleChangeStatus = async (orderId: string, newStatus: string) => {
    if (newStatus === "Success") {
      const confirm = window.confirm("Are you sure you want to mark this order as Paid?");
      if (!confirm) return;
    }

    try {
      const response = await fetch(`http://localhost:3000/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Order status updated to ${newStatus} successfully!`);
        fetchOrders(paymentStatus); // Refresh dữ liệu
      } else {
        alert("Failed to update order status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h3 className={styles.heading}>Order List</h3>

        {/* Payment status filter */}
        <div className={styles.filterContainer}>
          <label>Payment Status: </label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <option value="">All</option>
            <option value="Success">Success</option>
            <option value="Deposited">Deposited</option>
            <option value="Failure">Failure</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>


      <div className={styles.mainContent}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHead}>
              <th>Order ID</th>
              <th>Customer Email</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className={styles.tableRow}>
                <td>{order._id}</td>
                <td>{order.userId?.email || "N/A"}</td>
                <td>{order.paymentMethod}</td>

                <td>
                  {order.paymentStatus === "Deposited" ? (
                    <select
                      className={styles.statusDropdown}
                      value={order.paymentStatus}
                      onChange={(e) => handleChangeStatus(order._id, e.target.value)}
                    >
                      <option value="Deposited">Deposited</option>
                      <option value="Success">Success</option>
                    </select>
                  ) : (
                    <span
                      className={`${styles.statusBadge} ${order.paymentStatus === "Success"
                        ? styles.success
                        : order.paymentStatus === "Failure"
                          ? styles.failure
                          : order.paymentStatus === "Expired"
                            ? styles.expired
                            : ""
                        }`}
                    >
                      <span className={styles.statusDot}></span>
                      {order.paymentStatus}
                    </span>
                  )}
                </td>

                <td>{order.totalAmount.toLocaleString()} VND</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>

                <td>
                  <button className={styles.viewButton} onClick={() => fetchOrderDetails(order._id)}>
                    <FaInfoCircle className={styles.infoIcon} /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {isModalOpen && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
            <p><strong>Email:</strong> {selectedOrder.userId?.email || "N/A"}</p>
            <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
            <p><strong>Status:</strong> {selectedOrder.paymentStatus}</p>
            <p><strong>Total Amount:</strong> {selectedOrder.totalAmount.toLocaleString()} VND</p>

            <p><strong>Prepaid Amount:</strong>
              {selectedOrder.paymentStatus === "Success"
                ? selectedOrder.totalAmount.toLocaleString()
                : (selectedOrder.prepaidAmount ?? 0).toLocaleString()} VND
            </p>

            <p><strong>Remaining Amount:</strong>
              {selectedOrder.paymentStatus === "Success"
                ? "0"
                : (selectedOrder.remainingAmount !== undefined && selectedOrder.remainingAmount !== null
                  ? selectedOrder.remainingAmount.toLocaleString()
                  : (selectedOrder.totalAmount - (selectedOrder.prepaidAmount ?? 0)).toLocaleString())} VND
            </p>

            <p><strong>Created Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderContent