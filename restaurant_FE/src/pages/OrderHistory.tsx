import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faClock,
  faCoins,
  faExclamationCircle,
  faTimes,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../css/orderHistory.module.css";
import Cookies from "js-cookie";

interface Dish {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface OrderItem {
  _id: string;
  dishId: Dish;
  quantity: number;
  priceAtTime: number;
}

interface Booking {
  orderType: string;
  bookingDate: string;
  status: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  bookingId?: Booking;
  items: OrderItem[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("You need to log in to view order history");
          return;
        }

        const response = await fetch("http://localhost:3000/api/history/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          Cookies.remove("token");
          return;
        }

        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.message || "An error occurred while loading data");
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
        setError("An error occurred while loading data");
      }
    };

    fetchOrders();
  }, []);

  const openOrderDetail = async (order: Order) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("You need to log in to view order details");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/history/order/${order._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.data);
      } else {
        setError(data.message || "An error occurred while fetching order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("An error occurred while fetching order details");
    }
  };

  const openFeedbackModal = (dish: Dish) => {
    setSelectedDish(dish);
    setFeedbackModalOpen(true);
    setSelectedOrder(null); // Hide order modal when opening feedback
  };

  const closeModal = () => {
    if (feedbackModalOpen) {
      setFeedbackModalOpen(false);
      setSelectedOrder(selectedOrder); // Show order modal again when closing feedback
    } else {
      setSelectedOrder(null);
      setFeedbackModalOpen(false);
      setSelectedDish(null);
      setRating(0);
      setComment("");
      setFeedbackError(null);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setFeedbackError("Please select a valid rating from 1 to 5");
      return;
    }

    try {
      const token = Cookies.get("token");
      if (!token) {
        setFeedbackError("You need to log in to submit feedback");
        return;
      }

      const response = await fetch("http://localhost:3000/api/feedback/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dish_id: selectedDish?._id,
          rating,
          comment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFeedbackModalOpen(false);
        alert("Feedback submitted successfully!");
      } else {
        setFeedbackError(data.message || "An error occurred while submitting feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackError("An error occurred while submitting feedback");
    }
  };

  if (error) {
    return (
      <div className={styles.alertDanger}>
        <FontAwesomeIcon icon={faExclamationCircle} className={styles.icon} />
        {error}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {orders.length > 0 ? (
        <div>
          <h2 className={styles.heading}>
            <FontAwesomeIcon icon={faBox} className={styles.icon} />
            Order History
          </h2>
          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th>
                  <FontAwesomeIcon icon={faBox} className={styles.icon} />
                  Order ID
                </th>
                <th>
                  <FontAwesomeIcon icon={faClock} className={styles.icon} />
                  Date
                </th>
                <th>Payment Status</th>
                <th>
                  <FontAwesomeIcon icon={faCoins} className={styles.icon} />
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} onClick={() => openOrderDetail(order)}>
                  <td>{order._id.slice(-6)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td
                    className={
                      order.paymentStatus === "Success"
                        ? styles.paidStatus
                        : styles.unpaidStatus
                    }
                  >
                    {order.paymentStatus}
                  </td>
                  <td>{order.totalAmount.toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedOrder && (
            <div className={styles.modalOverlay} onClick={closeModal}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <h3>🧾 Order Details</h3>

                <p className={styles.mb5}>
                  <strong>Order ID:</strong>{selectedOrder._id}
                </p>

                <p className={styles.mb5}>
                  <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>

                <p className={styles.mb5}>
                  <strong>Total Amount:</strong> {selectedOrder.totalAmount.toLocaleString()} VND
                </p>

                <p className={styles.mb5}>
                  <strong>Payment Status:</strong> {selectedOrder.paymentStatus}
                </p>

                <p className={styles.mb5}>
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                </p>
                {selectedOrder.bookingId && (
                  <>
                    <p className={styles.mb5}>
                      <strong>Order Type:</strong> {selectedOrder.bookingId.orderType}
                    </p>
                    <p className={styles.mb5}>
                      <strong>Booking Date:</strong>{" "}
                      {new Date(selectedOrder.bookingId.bookingDate).toLocaleDateString()}
                    </p>
                    <p style={{ marginBottom: '15px' }}>
                      <strong>Booking Status:</strong> {selectedOrder.bookingId.status}
                    </p>
                  </>
                )}

                <table className={styles.orderTable}>
                  <thead>
                    <tr>
                      <th>Dish Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedOrder.items.map((item) => {
                      const price = item.dishId.price ?? 0;
                      const quantity = item.quantity ?? 0;
                      const subtotal = price * quantity;

                      return (
                        <tr key={item._id}>
                          <td>{item.dishId.name}</td>
                          <td style={{ textAlign: "center" }}>{quantity}</td>
                          <td>{price.toLocaleString()} VND</td>
                          <td>{subtotal.toLocaleString()} VND</td>
                          <td>
                            <button
                              className={styles.btn}
                              onClick={() => openFeedbackModal(item.dishId)}
                            >
                              Feedback
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {feedbackModalOpen && (
            <div className={styles.modalOverlay} onClick={closeModal}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <div>
                  <label className={styles.feedbackLabel}>Rating:</label>
                  <div className={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={star}
                        icon={faStar}
                        className={
                          star <= rating ? styles.selectedStar : styles.unselectedStar
                        }
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className={styles.feedbackLabel}>Comment:</label>
                  <textarea
                    className={styles.feedbackTextarea}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your comment..."
                  />
                </div>
                {feedbackError && (
                  <div className={styles.alertDanger}>{feedbackError}</div>
                )}
                <button className={styles.btn} onClick={handleFeedbackSubmit}>
                  Submit Feedback
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noOrder}>
          <p>There are no order record in history</p>
        </div>
      )}
    </div>
  );
}