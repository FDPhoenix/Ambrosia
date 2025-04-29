import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faInfoCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import styles from "../css/BookingHistory.module.css";

interface Booking {
  _id: string;
  orderType: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  tableId?: {
    tableNumber: number;
    capacity: number;
  };
}

interface BookingDetail {
  _id: string;
  orderType: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  contactPhone: string;
  bookingDishes: {
    dishId: {
      name: string;
      price: number;
      description: string;
    };
    quantity: number;
  }[];
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("You need to log in to view booking history");
          return;
        }

        const response = await fetch("http://localhost:3000/api/history/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          Cookies.remove("token");
          navigate("/login");
          return;
        }

        const data = await response.json();
        if (data.success) {
          setBookings(data.data);
        } else {
          setError(data.message || "An error occurred while loading data");
        }
      } catch (error) {
        console.error("Error fetching booking history:", error);
        setError("An error occurred while loading data");
      }
    };

    fetchBookings();
  }, [navigate]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`http://localhost:3000/api/history/booking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSelectedBooking(data.data);
      } else {
        setError(data.message || "An error occurred while loading booking details");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("An error occurred while loading booking details");
    }
  };

  const handleRowClick = (bookingId: string) => {
    fetchBookingDetails(bookingId);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
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
      {bookings.length > 0 ? (
        <div>
          <h2 className={styles.heading}>
            <FontAwesomeIcon icon={faCalendarCheck} className={styles.icon} />
            Booking History
          </h2>
          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Table Number</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter(booking => booking.startTime != null && booking.endTime != null)
                .map((booking) => (
                  <tr key={booking._id} onClick={() => handleRowClick(booking._id)}>
                    <td>{booking._id.slice(-6)}</td>
                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td>{`${booking.startTime} - ${booking.endTime}`}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className={`${styles.icon} ${booking.status === "confirmed" ? "text-success" : "text-warning"
                          }`}
                      />
                      {booking.status}
                    </td>
                    <td>
                      {booking.tableId
                        ? `${booking.tableId.tableNumber} (Capacity: ${booking.tableId.capacity})`
                        : "No table"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {selectedBooking && (
            <div className={styles.modalOverlay} onClick={handleOverlayClick}>
              <div className={styles.modalContent}>
                <h3>🧾 Booking Details</h3>
                <p className={styles.mb5}>
                  <strong>Booking Date:</strong>{" "}
                  {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                </p>

                <p className={styles.mb5}>
                  <strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}
                </p>

                <p className={styles.mb5}>
                  <strong>Status:</strong> {selectedBooking.status}
                </p>

                <p className={styles.mb5}>
                  <strong>Notes:</strong> {selectedBooking.notes || "None"}
                </p>

                <p style={{ marginBottom: '15px' }}>
                  <strong>Contact Phone:</strong> {selectedBooking.contactPhone}
                </p>
                <table className={styles.orderTable}>
                  <thead>
                    <tr>
                      <th>Dish Name</th>
                      <th>Price</th>
                      <th>Description</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBooking.bookingDishes.map((dish, index) => (
                      <tr key={index}>
                        <td>{dish.dishId.name}</td>
                        <td style={{ width: '130px' }}>{dish.dishId.price.toLocaleString()} VND</td>
                        <td>{dish.dishId.description}</td>
                        <td style={{ textAlign: 'center' }}>{dish.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noBooking}>
          <p>There are no booking record in history</p>
        </div>
      )}
    </div>
  );
}