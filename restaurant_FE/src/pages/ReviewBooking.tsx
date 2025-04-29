import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import styles from "../css/ReviewBooking.module.css";
import vnpayLogo from "../assets/Icon-VNPAY-QR.webp";
import { toast } from "react-toastify";
interface Dish {
  dishId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Booking {
  _id: string;
  tableId: { _id: string; tableNumber: string } | null;
  bookingDate: string;
  startTime: string;
  notes: string;
  status: string;
  dishes: Dish[];
  customer?: { name: string; email: string; contactPhone: string }; // Thêm customer nếu cần
}

interface ReviewBookingProps {
  bookingId: string;
  closeModal: () => void;
  openReviewExperienceModal: (bookingId: string) => void;
}

const ReviewBooking: React.FC<ReviewBookingProps> = ({ bookingId, closeModal, openReviewExperienceModal }) => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [availableTables, setAvailableTables] = useState<{ _id: string; tableNumber: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null);
  const [dishToDelete, setDishToDelete] = useState<string | null>(null);
  const [noTablesAvailable, setNoTablesAvailable] = useState(false);
  const [originalBooking, setOriginalBooking] = useState<Booking | null>(null);
  const [isVNPaySelected, setIsVNPaySelected] = useState(false);
  const [billDetails, setBillDetails] = useState({ totalAmount: 0, prepaidAmount: 0 });
  const isOrderAtRestaurant = (isEditing ? editedBooking?.dishes?.length : booking?.dishes?.length) === 0;

  const calculateBill = (dishes) => {
    const totalAmount = dishes.reduce((sum, dish) => sum + dish.price * dish.quantity, 0);
    const prepaidAmount = Math.round(totalAmount * 0.3);
    return { totalAmount, prepaidAmount };
  };

  useEffect(() => {
    const dishes = isEditing ? editedBooking?.dishes || [] : booking?.dishes || [];
    if (dishes.length > 0) {
      setBillDetails(calculateBill(dishes));
    } else {
      setBillDetails({ totalAmount: 0, prepaidAmount: 0 });
    }
  }, [booking, editedBooking, isEditing]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get<Booking>(`http://localhost:3000/bookings/${bookingId}`);
        setBooking(response.data);
        setEditedBooking(response.data);
        setOriginalBooking(response.data);
        setLoading(false);
      } catch (error) {
        setError("Unable to load booking information!");
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (isEditing && (!editedBooking?.bookingDate || !editedBooking?.tableId)) {
      fetchBookingDetailsForEditing();
    }
  }, [isEditing]);

  const fetchBookingDetailsForEditing = async () => {
    try {
      const response = await axios.get<Booking>(`http://localhost:3000/bookings/${bookingId}`);
      if (response.data.bookingDate) {
        response.data.bookingDate = new Date(response.data.bookingDate).toISOString().split("T")[0];
      }
      setEditedBooking(response.data);
    } catch (error) {
      console.error("Error retrieving booking information:", error);
    }
  };

  useEffect(() => {
    if (isEditing && editedBooking?.bookingDate && editedBooking?.startTime) {
      fetchAvailableTablesForEditing(editedBooking.bookingDate, editedBooking.startTime, editedBooking.tableId?._id || null);
    }
  }, [isEditing, editedBooking?.bookingDate, editedBooking?.startTime]);

  const fetchAvailableTablesForEditing = async (date: string, time: string, currentTableId: string | null) => {
    try {
      if (!date || !time) return;
      const response = await axios.get(`http://localhost:3000/bookings/available-tables`, {
        params: { bookingDate: date, startTime: time },
      });
      let filteredTables = response.data.filter((table) => table.isAvailable);
      if (currentTableId && !filteredTables.some((t) => t._id === currentTableId)) {
        const currentTableResponse = await axios.get(`http://localhost:3000/tables/${currentTableId}`);
        filteredTables.push(currentTableResponse.data);
      }
      setAvailableTables(filteredTables);
      setNoTablesAvailable(filteredTables.length === 0);
    } catch (error) {
      console.error("Error retrieving table list:", error);
    }
  };

  const handleUpdateBooking = async () => {
    try {
      if (!editedBooking) return;
      const response = await axios.put(`http://localhost:3000/bookings/${bookingId}`, {
        tableId: editedBooking.tableId?._id,
        bookingDate: editedBooking.bookingDate,
        startTime: editedBooking.startTime,
        notes: editedBooking.notes,
        dishes: editedBooking.dishes.map((d) => ({
          dishId: d.dishId,
          quantity: d.quantity,
        })),
      });
      toast.success("Update successful!");
      setBooking({
        ...response.data.booking,
        dishes: editedBooking.dishes,
        customer: booking?.customer,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating!", error);
      toast.error("Error updating!");
    }
  };

  const handleDeleteDish = (dishId: string) => {
    if (!editedBooking) return;
    setEditedBooking({
      ...editedBooking,
      dishes: editedBooking.dishes.filter((dish) => dish.dishId !== dishId),
    });
    setDishToDelete(null);
  };

  const handleConfirmBooking = async () => {
    try {
      console.log("Processing booking for bookingId:", bookingId);
      if (isOrderAtRestaurant) {
        const confirmResponse = await axios.put(`http://localhost:3000/bookings/${bookingId}/confirm`);
        console.log("Booking confirmation API response:", confirmResponse.data);
        if (confirmResponse.data.message.includes("Email hóa đơn đã được gửi")) {
          toast.success("Booking has been confirmed & email sent!");
        } else {
          toast.warning("Booking confirmed, but email not sent!");
        }
        setBooking((prev) => (prev ? { ...prev, status: "confirmed" } : prev));
        closeModal();
      } else {
        if (!isVNPaySelected) {
          toast.warning("Vui lòng chọn thanh toán qua VNPay trước khi xác nhận!");
          return;
        }
        const checkoutResponse = await axios.post(`http://localhost:3000/payment/checkoutBooking`, {
          bookingId: bookingId,
        });
        console.log("Order created successfully:", checkoutResponse.data);
        const { orderId } = checkoutResponse.data;
        const confirmResponse = await axios.put(`http://localhost:3000/bookings/${bookingId}/confirm`);
        console.log("Booking confirmation API response:", confirmResponse.data);
        if (confirmResponse.data.message.includes("Email hóa đơn đã được gửi")) {
          toast.success("Booking has been confirmed & email sent!");
        } else {
          toast.warning("Booking confirmed, but email not sent!");
        }
        setBooking((prev) => (prev ? { ...prev, status: "confirmed" } : prev));
        closeModal();
        const paymentResponse = await axios.post(`http://localhost:3000/payment/vnpay-create?orderId=${orderId}`);
        console.log("Payment URL generated:", paymentResponse.data.paymentUrl);
        window.location.href = paymentResponse.data.paymentUrl;
      }
    } catch (error) {
      console.error("Error in booking confirmation process:", error.response ? error.response.data : error.message);
      toast.error("Error processing booking confirmation or payment!");
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    console.log("Deleting booking:", bookingId);
    if (!bookingId) {
      toast.error("Error: Booking ID is missing!");
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:3000/bookings/${bookingId}`);
      console.log("Booking deleted:", response.data);
      toast.success("Booking has been cancelled!");
      closeModal();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      if (error.response) {
        toast.error(`Server Error: ${error.response.status} - ${error.response.data.message || "Unknown error"}`);
      } else {
        toast.error("Network error. Please try again!");
      }
    }
  };

  const handleDishChange = (dishId, newQuantity) => {
    if (!editedBooking) return;
    if (newQuantity === 0) {
      setDishToDelete(dishId);
    } else {
      const updatedDishes = editedBooking.dishes.map((dish) =>
        dish.dishId === dishId ? { ...dish, quantity: newQuantity } : dish
      );
      setEditedBooking((prev) => ({ ...prev!, dishes: updatedDishes }));
    }
  };

  const confirmDeleteDish = (dishId) => {
    setDishToDelete(dishId);
  };

  if (loading) return <p className={styles.p}>Đang tải thông tin...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.heading}>Review Booking</h2>
        <div className={styles.modalBody}>
          {!isEditing && (
            <>
              <div className={styles.detailRow}>
                <label>Customer:</label> <span>{booking?.customer?.name || "No name"}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Email:</label> <span>{booking?.customer?.email || "No email"}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Phone number:</label>
                <span>{booking?.customer?.contactPhone || "No phone number"}</span>
              </div>
            </>
          )}
          <div className={styles.detailRow}>
            <label>Booking Date:</label>
            <span>
              {isEditing ? (
                <input
                  type="date"
                  value={editedBooking?.bookingDate || ""}
                  onChange={(e) =>
                    setEditedBooking((prev: any) => ({
                      ...prev,
                      bookingDate: e.target.value,
                      tableId: null,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              ) : (
                booking?.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("vi-VN") : "Không rõ"
              )}
            </span>
          </div>
          <div className={styles.detailRow}>
            <label>Select time:</label>
            <span>
              {isEditing ? (
                <select
                  value={editedBooking?.startTime || ""}
                  onChange={(e) =>
                    setEditedBooking((prev: any) => ({
                      ...prev,
                      startTime: e.target.value,
                      tableId: null,
                    }))
                  }
                >
                  <option value="" disabled>
                    Select time
                  </option>
                  {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              ) : (
                booking?.startTime
              )}
            </span>
          </div>
          <div className={styles.detailRow}>
            <label>Table Number:</label>
            <span>
              {isEditing ? (
                noTablesAvailable ? (
                  <span className={styles.errorText}>No available tables</span>
                ) : (
                  <select
                    value={editedBooking?.tableId?._id || ""}
                    onChange={(e) => {
                      const selectedTable = availableTables.find((t) => t._id === e.target.value) || null;
                      setEditedBooking((prev) => (prev ? { ...prev, tableId: selectedTable } : prev));
                    }}
                  >
                    {editedBooking?.tableId && !noTablesAvailable ? (
                      <option value={editedBooking.tableId._id}>{editedBooking.tableId.tableNumber}</option>
                    ) : (
                      <option value="">Select table</option>
                    )}
                    {availableTables.map((table) => (
                      <option key={table._id} value={table._id}>
                        {table.tableNumber}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                booking?.tableId?.tableNumber || "Không rõ"
              )}
            </span>
          </div>
          <div className={styles.detailRow}>
            {!isEditing && (
              <div className={styles.statusContainer}>
                <label>Status: </label>
                <span className={`${styles.status} ${styles[booking?.status]}`}>{booking?.status}</span>
              </div>
            )}
          </div>
          <div className={styles.notesContainer}>
            <strong>Customer Notes:</strong>
            <p className={styles.p}>
              {isEditing ? (
                <textarea
                  className={styles.note}
                  value={editedBooking?.notes || ""}
                  onChange={(e) => setEditedBooking({ ...editedBooking, notes: e.target.value })}
                />
              ) : (
                booking?.notes || "Không có"
              )}
            </p>
          </div>
          <h3 className={styles.Menu}>Dish List</h3>
          {isEditing ? (
            <table className={styles.editTable}>
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {editedBooking?.dishes?.map((dish) => (
                  <tr key={dish.dishId}>
                    <td>{dish.name}</td>
                    <td>
                      <div className={styles.dishControls}>
                        <button className={styles.changeButton} onClick={() => handleDishChange(dish.dishId, dish.quantity - 1)}>
                          -
                        </button>
                        <span className={styles.quantity}>{dish.quantity}</span>
                        <button className={styles.changeButton} onClick={() => handleDishChange(dish.dishId, dish.quantity + 1)}>
                          +
                        </button>
                      </div>
                    </td>
                    <td>{dish.price.toLocaleString()} VND</td>
                    <td>{(dish.price * dish.quantity).toLocaleString()} VND</td>
                    <td>
                      <button className={styles.deleteButton} onClick={() => confirmDeleteDish(dish.dishId)}>
                        X
                      </button>
                    </td>
                  </tr>
                ))}
                {editedBooking?.dishes?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.noDishes}>
                      Order at the restaurant
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr className={styles.totalRow}>
                      <td colSpan={3}>
                        <strong>Total Amount:</strong>
                      </td>
                      <td>
                        <strong>{billDetails.totalAmount.toLocaleString()} VND</strong>
                      </td>
                      <td></td>
                    </tr>
                    <tr className={styles.prepaidRow}>
                      <td colSpan={3}>
                        <strong>Prepaid Amount (30%):</strong>
                      </td>
                      <td>
                        <strong>{billDetails.prepaidAmount.toLocaleString()} VND</strong>
                      </td>
                      <td></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          ) : (
            <table className={styles.reviewTable}>
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {booking?.dishes?.map((dish) => (
                  <tr key={dish.dishId}>
                    <td>{dish.name}</td>
                    <td>x{dish.quantity}</td>
                    <td>{dish.price.toLocaleString()} VND</td>
                    <td>{(dish.price * dish.quantity).toLocaleString()} VND</td>
                  </tr>
                ))}
                {booking?.dishes?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.noDishes}>
                      Order at the restaurant
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr className={styles.totalRow}>
                      <td colSpan={3}>
                        <strong>Total Amount:</strong>
                      </td>
                      <td>
                        <strong>{billDetails.totalAmount.toLocaleString()} VND</strong>
                      </td>
                    </tr>
                    <tr className={styles.prepaidRow}>
                      <td colSpan={3}>
                        <strong>Prepaid Amount (30%):</strong>
                      </td>
                      <td>
                        <strong>{billDetails.prepaidAmount.toLocaleString()} VND</strong>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          )}
          {dishToDelete && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3 className={styles.confirmContent}>Confirm Dish Deletion</h3>
                <p className={styles.p}>Are you sure you want to remove this dish from the order list?</p>
                <div className={styles.modalActions}>
                  <button className={styles.confirmButton} onClick={() => handleDeleteDish(dishToDelete)}>
                    Confirm
                  </button>
                  <button className={styles.cancelButton} onClick={() => setDishToDelete(null)}>
                    Undo
                  </button>
                </div>
              </div>
            </div>
          )}
          {!isOrderAtRestaurant && (
            <div className={styles.paymentOption}>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={isVNPaySelected}
                  onChange={(e) => setIsVNPaySelected(e.target.checked)}
                />
                <img src={vnpayLogo} alt="VNPay" className={styles.vnpayLogo} />
              </label>
            </div>
          )}
          <div className={styles.buttonGroup}>
            {!isEditing && (
              <>
                <button className={styles.confirmButton} onClick={handleConfirmBooking}>
                  Confirm
                </button>
                <div className={styles.buttonRow}>
                  <button
                    className={styles.editButton}
                    onClick={async () => {
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className={styles.cancelButton} onClick={handleCancelBooking}>
                    Cancel
                  </button>
                </div>
              </>
            )}
            {isEditing && (
              <>
                <button
                  className={styles.cancelEditButton}
                  onClick={async () => {
                    try {
                      const response = await axios.get(`http://localhost:3000/bookings/${bookingId}`);
                      setEditedBooking((prev: any) => ({
                        ...prev,
                        notes: response.data.notes,
                      }));
                    } catch (error) {
                      console.error("Error fetching latest note:", error);
                    }
                    setIsEditing(false);
                  }}
                >
                  Cancel Edit
                </button>
                <button
                  className={styles.saveButton}
                  onClick={() => {
                    if (!editedBooking?.tableId) {
                      toast.error("Error: Please select a table before saving!");
                      return;
                    }
                    handleUpdateBooking();
                  }}
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewBooking;