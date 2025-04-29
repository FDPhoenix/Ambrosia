import { useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "../../css/ChefCss/BookingOrderManagement.module.css";
import { Table, Button } from "react-bootstrap";
import axios from "axios";
import { FaInfoCircle, FaFilter } from 'react-icons/fa';
import { BsSearch } from 'react-icons/bs'

interface Booking {
    _id: string;
    userId?: { fullname: string; email: string; phoneNumber: string };
    tableId?: { tableNumber: string; capacity: number };
    bookingDate: string;
    startTime: string;
    endTime: string;
    orderType: string;
    status: string;
    dishes?: {
        dishId: {
            imageUrl: string;
            name: string;
            price: number;
        };
        quantity: number;
    }[];
    guest?: { name: string; contactPhone: string, email: string };
    notes?: string;
    deliveryAddress?: string;
}

const BookingOrderManagement = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reload] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: "",
        fromDate: "",
        toDate: "",
        orderType: "",
        status: "",
        searchText: "",
    });
    const [noResultsFound, setNoResultsFound] = useState(false);


    useEffect(() => {
        fetchTables();
    }, [reload]);

    const fetchTables = async () => {
        try {
            const response = await axios.get("http://localhost:3000/reservation/staff");

            setBookings(response.data);
        } catch (error) {
            console.error("Error fetching tables:", error);
        }
    };


    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const handleApplyFilter = async () => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.dateRange) queryParams.append("dateRange", filters.dateRange);
            if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
            if (filters.toDate) queryParams.append("toDate", filters.toDate);
            if (filters.orderType) queryParams.append("orderType", filters.orderType);
            if (filters.status) queryParams.append("status", filters.status);
            if (filters.searchText.trim() !== "") queryParams.append("searchText", filters.searchText.trim());

            const response = await axios.get(`http://localhost:3000/reservation/filters?${queryParams.toString()}`);

            if (response.data.length === 0) {
                setBookings([]);
                setNoResultsFound(true);
            } else {
                setBookings(response.data);
                setNoResultsFound(false);
            }

            setFilterModalOpen(false);
        } catch (error) {
            console.error("Error filtering reservations:", error);
        }
    };


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (filters.searchText.trim() === "") {
                fetchTables();
                setNoResultsFound(false);
            } else {
                handleApplyFilter();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.searchText]);

    const statusModelStyles = {
        Confirmed: { color: "green" },
        Pending: { color: "#ffad00" },
        Canceled: { color: "red" },
        Unknown: { color: "rgb(147 147 147)" }
    };

    const getStatus = (status: string) => {
        const normalizedStatus = status?.toLowerCase();
        if (normalizedStatus === "confirmed") return "Confirmed";
        if (normalizedStatus === "pending") return "Pending";
        if (normalizedStatus === "canceled") return "Canceled";
        return "Unknown";
    };

    return (
        <div className={styles.contentContainer}>
            <div className={styles.contentTitle}>
                <h3>Order Management List</h3>
                <div className={styles.contentFilter}>
                    <Button onClick={() => setFilterModalOpen(true)}>
                        <span ><FaFilter /></span> Add Filter
                    </Button>

                    <form
                        className={styles.searchContainer}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleApplyFilter();
                        }}
                    >
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Searching Customer Name...."
                            value={filters.searchText}
                            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                        />
                        <button type="submit">
                            <BsSearch className={styles.searchIcon} />
                        </button>
                    </form>


                </div>
            </div>

            <div className={styles.mainContent}>
                {noResultsFound ? (
                    <div className={styles.noResults}>
                        {/* <p>No results found for "<strong>{filters.searchText}</strong>"</p> */}
                        <p>No results found</p>
                    </div>
                ) : (
                    <Table striped bordered hover responsive className={styles.reservationTable}>
                        <thead>
                            <tr>
                                <th>Order Number</th>
                                <th>Customer Name</th>
                                <th>Booking Date</th>
                                <th>Order Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={booking._id}>
                                    <td>{index + 1}</td>
                                    <td>{booking.userId?.fullname || booking.guest?.name || "Unknown"}</td>
                                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                    {/* <td>{booking.startTime || "N/A"}</td> */}
                                    <td>
                                        <span className={`${styles.orderTypeBadge} ${styles[booking.orderType.toLowerCase()]}`}>
                                            {booking.orderType}
                                        </span>
                                    </td>
                                    {/* <td>
                                        <div
                                            className={styles.status}
                                            style={statusStyles[getStatus(booking.status)] || statusStyles.Unknown}
                                        >
                                            <span>{getStatus(booking.status)}</span>
                                        </div>
                                    </td> */}
                                    <td>
                                        <div className={`${styles.status} ${styles[getStatus(booking.status)]}`}>
                                            <span className={styles.dot}></span>
                                            <span>{getStatus(booking.status)}</span>
                                        </div>
                                    </td>

                                    <td>
                                        <Button variant="info" className={styles.actionButton} onClick={() => handleViewDetails(booking)}>
                                            <FaInfoCircle className={styles.viewIcon} /> View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>


            {/* React Modal */}
            <Modal isOpen={isModalOpen} onRequestClose={closeModal} className={styles.modal} overlayClassName={styles.overlay} shouldCloseOnOverlayClick={false} ariaHideApp={false}>
                <div className={styles.modalContent}>
                    <h3 className={styles.modalHeader}>Order details</h3>
                    {selectedBooking ? (
                        <>
                            <div className={styles.modalInfoContainer}>
                                <div className={styles.modalInfoRow}>
                                    <strong>Customer Name:</strong> <span>{selectedBooking.userId?.fullname || selectedBooking.guest?.name || "Unknown"}</span>
                                </div>
                                <div className={styles.modalInfoRow}>
                                    <strong>Email:</strong>
                                    <span>{selectedBooking.userId?.email || selectedBooking.guest?.email || "N/A"}</span>
                                </div>
                                <div className={styles.modalInfoRow}>
                                    <strong>Phone Number:</strong> <span>{selectedBooking.userId?.phoneNumber || selectedBooking.guest?.contactPhone || "N/A"}</span>
                                </div>
                                <div className={styles.modalInfoRow}>
                                    <strong>Booking Date:</strong> <span>{new Date(selectedBooking.bookingDate).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.modalInfoRow}>
                                    <strong>Order Type:</strong> <span>{selectedBooking.orderType}</span>
                                </div>
                                {selectedBooking.tableId ? (
                                    <div >
                                        <div className={styles.modalInfoRow}>
                                            <strong>Start Time:</strong> <span>{selectedBooking.startTime}</span>
                                        </div>
                                        <div className={styles.modalInfoRow}>
                                            <strong>End Time:</strong> <span>{selectedBooking.endTime}</span>
                                        </div>
                                        <div className={styles.modalInfoRow}>
                                            <strong>Table Name:</strong> <span>{selectedBooking.tableId.tableNumber}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.modalInfoRow}>
                                        <strong>Delivery Address:</strong> <span>{selectedBooking.deliveryAddress || "N/A"}</span>
                                    </div>
                                )}
                            </div>



                            <h5 className={styles.headerDishList}>Ordered Dishes List:</h5>
                            {selectedBooking.dishes && selectedBooking.dishes.length > 0 ? (
                                <Table striped bordered className={styles.modalTable}>
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Dish Name</th>
                                            <th>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedBooking.dishes.map((dish, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <img
                                                        src={dish.dishId.imageUrl || "https://via.placeholder.com/50"}
                                                        alt={dish.dishId.name}
                                                        className={styles.dishImage}
                                                    />
                                                </td>
                                                <td>{dish.dishId.name}</td>
                                                <td>x{dish.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className={styles.noOrderContainer}>
                                    <span className={styles.noOrderText}><strong>Order at the restaurant</strong></span>
                                </div>
                            )}


                            <div className={styles.modalInfoRow}>
                                <strong>Notes:</strong> <span>{selectedBooking.notes || "N/A"}</span>
                            </div>
                            <div className={styles.modalInfoRow}>
                                <strong>Status:</strong>
                                <span
                                    className={styles.statusLabel}
                                    style={statusModelStyles[getStatus(selectedBooking.status)] || statusModelStyles.Unknown}
                                >
                                    {getStatus(selectedBooking.status)}
                                </span>
                            </div>


                            <div className={styles.modalButtons}>
                                <button className={styles.closeButton} onClick={closeModal}>Close</button>
                            </div>
                        </>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </Modal>


            {/* Modal Filter */}
            <Modal isOpen={filterModalOpen} onRequestClose={() => setFilterModalOpen(false)} className={styles.modal} overlayClassName={styles.overlay} shouldCloseOnOverlayClick={false} ariaHideApp={false}>
                <div className={styles.modalContent}>
                    <h3 className={styles.modalHeader}>Filter Reservations</h3>
                    <div className={styles.formFields}>
                        <label>Date Range</label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value, fromDate: "", toDate: "" })}
                            disabled={!!filters.fromDate || !!filters.toDate}
                            className={styles.formFilter}
                        >
                            <option value="">All</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="thisMonth">This Month</option>
                            <option value="lastMonth">Last Month</option>
                        </select>

                        <label>From Date</label>
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value, dateRange: "", toDate: "" })}
                            disabled={!!filters.dateRange}
                            className={styles.formFilter}
                        />

                        <label>To Date</label>
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                            disabled={!filters.fromDate || !!filters.dateRange}
                            min={filters.fromDate}
                            className={styles.formFilter}
                        />

                        <label>Order Type</label>
                        <select value={filters.orderType} onChange={(e) => setFilters({ ...filters, orderType: e.target.value })} className={styles.formFilter}>
                            <option value="">All</option>
                            <option value="dine-in">Dine-in</option>
                            <option value="delivery">delivery</option>
                        </select>

                        <label>Status</label>
                        <select
                            value={filters.status || ""}
                            onChange={(e) => {
                                setFilters({
                                    ...filters,
                                    status: e.target.value,
                                });
                            }}
                            className={styles.formFilter}
                        >
                            <option value="">All</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Canceled">Canceled</option>
                        </select>



                    </div>

                    <div className={styles.modalButtons}>
                        <button className={styles.saveButton} onClick={handleApplyFilter}>Apply Filter</button>
                        <button className={styles.cancelButton} onClick={() => setFilterModalOpen(false)}>Close</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BookingOrderManagement;
