import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setBookingInfo } from "../redux/bookingSlice";
import { RootState } from "../redux/store";
import SelectDishes from "./SelectDishes";
import AddNote from "./AddNote ";
import ReviewBooking from "./ReviewBooking";
import { FaCalendarDays } from "react-icons/fa6";
import Header from "../components/Header";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { BsClock } from "react-icons/bs";
import styles from '../css/PageCss/ContactPage.module.css'
import CartSidebar from '../components/CartSideBar';

interface Table {
    _id: string;
    tableNumber: number;
    isAvailable: boolean;
}

const TableCard = ({
    table,
    selected,
    onSelect,
}: {
    table: Table;
    selected: boolean;
    onSelect: () => void;
}) => {
    const { tableNumber, isAvailable } = table;
    return (
        <div
            onClick={isAvailable ? onSelect : undefined}
            className={`cursor-pointer rounded-lg overflow-hidden p-4 transition-all duration-200 border
          ${selected ? "ring-4 ring-[#aa9c8c]" : ""}
          ${isAvailable
                    ? "bg-[#d7cfc6] hover:bg-[#c3b9a7] text-[#4a413b] border-[#b0a48a]"
                    : "bg-[#f0ede7] text-gray-400 border-gray-300 opacity-50 cursor-not-allowed"
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="bg-white rounded p-1">
                    <div className="grid grid-cols-3 gap-0.5">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-gray-500"></div>
                        ))}
                    </div>
                </div>
                <div className="text-2xl font-bold text-[#4a413b]">{tableNumber}</div>
            </div>
            <div className="flex justify-end text-sm text-[#4a413b] mb-2">Table number</div>
            <div>
                <span
                    className={`inline-block rounded px-3 py-1 text-sm font-medium ${isAvailable
                        ? "bg-white text-[#634a3e]"
                        : "bg-gray-200 text-gray-500"
                        }`}
                >
                    {isAvailable ? "Available" : "Booked"}
                </span>
            </div>
        </div>
    );
};


const BookingPage = () => {
    const dispatch = useDispatch();
    const bookingInfo = useSelector((state: RootState) => state.booking);
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [errors, setErrors] = useState({ name: "", phone: "", email: "" });
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [availableTables, setAvailableTables] = useState<Table[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [loadingTables, setLoadingTables] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderType, setOrderType] = useState<"preorder" | "inrestaurant" | null>(null);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
    const [isReviewBookingModalOpen, setIsReviewBookingModalOpen] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const tablesPerPage = 8;

    const totalPages = Math.ceil(availableTables.length / tablesPerPage);
    const paginatedTables = availableTables.slice(
        (currentPage - 1) * tablesPerPage,
        currentPage * tablesPerPage
    );

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) return;

        axios
            .get("http://localhost:3000/user/profile", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((res) => {
                const user = res.data.user;
                dispatch(setBookingInfo(user));
                setForm({
                    name: user.fullname,
                    email: user.email,
                    phone: user.phoneNumber,
                });
                setIsLoggedIn(true);
            })
            .catch(() => setIsLoggedIn(false));
    }, [dispatch]);

    const validate = () => {
        const nameErr = /^(?!\s)(?!.*\s{3,})[A-Za-zÀ-ỹ\s]+(?<!\s)$/.test(form.name) ? "" : "Invalid name";
        const phoneErr = /^\d{10,11}$/.test(form.phone) ? "" : "Invalid phone number";
        const emailErr = /^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email) ? "" : "Email không hợp lệ";
        setErrors({ name: nameErr, phone: phoneErr, email: emailErr });
        return !(nameErr || phoneErr || emailErr);
    };

    const fetchTables = async () => {
        setLoadingTables(true);
        try {
            const res = await axios.get("http://localhost:3000/bookings/available-tables", {
                params: { bookingDate: selectedDate, startTime: selectedTime },
            });
            setAvailableTables(res.data);
        } catch (err) {
            console.error("Error when fetching table list:", err);
        } finally {
            setLoadingTables(false);
        }
    };

    const handleSubmitInfo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn && !validate()) return;
        dispatch(setBookingInfo(form));
        if (!selectedDate || !selectedTime) {
            alert("Please select date and time");
            return;
        }
        setHasSearched(true);
        fetchTables();
    };


    const handleBookTable = async () => {
        if (!selectedTableId) {
            alert("Vui lòng chọn một bàn trước khi xác nhận.");
            return;
        }

        try {
            const token = Cookies.get("token");
            const response = await axios.post(
                "http://localhost:3000/bookings",
                {
                    tableId: selectedTableId,
                    bookingDate: selectedDate,
                    startTime: selectedTime,
                    orderType: "dine-in",
                    name: bookingInfo.name,
                    phone: bookingInfo.phone,
                    email: bookingInfo.email,
                    contactPhone: bookingInfo.phone,
                    notes: "",
                    dishes: [],
                },
                {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                }
            );
            const newBookingId = response.data.bookingId;
            if (newBookingId) {
                Cookies.set("bookingId", newBookingId);
                setBookingId(newBookingId);
                setShowSuccessModal(true);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Booking failed");
        }
    };

    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <div>
            <Header fixed={false} onCartToggle={toggleCart} />
            <div className="min-h-screen p-4">
                <div className="w-full bg-gradient-to-r from-stone-50 to-stone-100">
                    <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-6 py-6">

                        <div className="grid gap-12 lg:grid-cols-2 items-center mx-auto">

                            {/* PHẦN VĂN BẢN */}
                            <div className="space-y-6 md:space-y-9 pl-2 sm:pl-4 md:pl-8 lg:pl-12">
                                <h1 className="text-2 sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                                    Make a Reservation
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl text-gray-700">
                                    Enjoy a great dining experience with elegant ambiance and signature dishes. Book your table today to secure the best spot.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FaCalendarDays className="h-5 w-5 text-amber-600" />
                                        <span className="text-sm sm:text-base">Easy Reservation</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <BsClock className="h-5 w-5 text-amber-600" />
                                        <span>Quick Confirmation</span>
                                    </div>
                                </div>
                            </div>

                            {/* PHẦN HÌNH ẢNH */}
                            <div className="relative mt-10 lg:mt-0">
                                <div className="rounded-lg overflow-hidden shadow-xl">
                                    <img
                                        src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/de/9e/ea/getlstd-property-photo.jpg?w=1400&h=800&s=1"
                                        alt="Không gian nhà hàng"
                                        className="w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                                    <div className="text-amber-600 font-bold">Opening Hours</div>
                                    <div className="text-gray-700">Daily: 08:00 AM – 11:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BƯỚC ĐẶT BÀN */}
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="bg-white rounded-lg shadow-md p-6 md:p-10 mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8">Table Reservation Info</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
                                {[1, 2, 3].map((step, idx) => {
                                    const titles = ["Fill In Information", "Choose a Table", "Confirmation"];
                                    const descs = [
                                        "Enter your personal information and the desired booking time",
                                        "Choose the perfect table based on your group size and seating preference for a better dining experience.",
                                        "Receive booking confirmation via your Email",
                                    ];
                                    return (
                                        <div
                                            key={idx}
                                            className="bg-[#ede4daf0] p-6 rounded-lg flex flex-col items-center"
                                        >
                                            <div className="bg-[#887b62] w-14 h-14 mb-4 rounded-full flex items-center justify-center">
                                                <span className="text-[#fff] text-2xl font-bold">{step}</span>
                                            </div>
                                            <h3 className="font-semibold text-[#5b5549] text-lg">{titles[idx]}</h3>
                                            <p className="text-[#5b5549] text-sm mt-2 max-w-xs">{descs[idx]}</p>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>


                <div className="flex flex-col md:flex-row w-full gap-6 px-4">
                    <div className="w-full md:w-1/2 bg-white p-8">
                        <h2 className="text-2xl font-bold m-4 mb-8 text-center">Make a Reservation</h2>
                        <form onSubmit={handleSubmitInfo} className="space-y-4">
                            {!isLoggedIn && (
                                <>
                                    <input type="text" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full p-2 border rounded" />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                    <input type="text" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="w-full p-2 border rounded" />
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                    <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full p-2 border rounded" />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </>
                            )}
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full p-2 border rounded" />
                            <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full p-2 border rounded">
                                <option value="">Select time</option>
                                {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="w-full bg-[#887b62] hover:bg-[#4a382f] text-white py-2 rounded-md transition-colors"
                            >
                                Find available tables
                            </button>

                        </form>
                    </div>

                    <div className="w-full md:w-1/2 bg-white pt-8 pr-8 pl-8 pb-4">
                        <h2 className="text-2xl font-bold m-4 mb-8 text-center">Choose Table</h2>

                        {!hasSearched ? (
                            <div className="flex flex-col items-center justify-center min-h-[334px] bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center px-8 py-10">
                                <p className="text-gray-600 text-lg font-medium mb-2">Please select date and time to see available tables</p>
                                <p className="text-gray-500 text-sm">The system will display available tables corresponding to your selected time slot</p>
                            </div>
                        ) : loadingTables ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-gray-500">Loading table list...</p>
                            </div>
                        ) : availableTables.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-red-500 font-medium">
                                No tables available at this time. Please select another time.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {paginatedTables.map((table) => (
                                        <TableCard
                                            key={table._id}
                                            table={table}
                                            selected={selectedTableId === table._id}
                                            onSelect={() => setSelectedTableId(table._id)}
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-4 space-x-2">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`w-10 h-10 flex items-center justify-center border rounded-full text-lg
              ${currentPage === 1
                                                    ? "text-gray-400 border-gray-300"
                                                    : "text-black hover:bg-gray-100 border-gray-400"}`}
                                        >
                                            ‹
                                        </button>

                                        {/* Page Numbers */}
                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => setCurrentPage(index + 1)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full border text-sm font-medium transition-colors duration-200
                ${currentPage === index + 1
                                                        ? "bg-[#d7cfc6] text-[#4a413b] border-[#b0a48a]"
                                                        : "bg-white text-black border-gray-300 hover:bg-gray-100"}`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}

                                        {/* Next */}
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={`w-10 h-10 flex items-center justify-center border rounded-full text-lg
              ${currentPage === totalPages
                                                    ? "text-gray-400 border-gray-300"
                                                    : "text-black hover:bg-gray-100 border-gray-400"}`}
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={handleBookTable}
                                    className="mt-4 w-full bg-[#887b62] hover:bg-[#4a382f] text-white py-2 rounded hover:bg-green-700"
                                >
                                    Confirm booking
                                </button>
                            </>
                        )}
                    </div>


                </div>

                {showSuccessModal && bookingId && (
                    <SelectDishes
                        bookingId={bookingId}
                        onOrderTypeChange={(type) => {
                            if (type === "order-at-restaurant") setOrderType("inrestaurant");
                        }}
                        openAddNoteModal={() => {
                            setShowSuccessModal(false);
                            setIsAddNoteModalOpen(true);
                        }}
                    />
                )}

                {orderType === "preorder" && bookingId && (
                    <SelectDishes
                        bookingId={bookingId}
                        onOrderTypeChange={(type) => {
                            if (type === "order-at-restaurant") setOrderType("inrestaurant");
                        }}
                        openAddNoteModal={() => {
                            setIsAddNoteModalOpen(true);
                        }}
                    />
                )}

                {isAddNoteModalOpen && bookingId && (
                    <AddNote
                        bookingId={bookingId}
                        openReviewBookingModal={(id) => {
                            setIsAddNoteModalOpen(false);
                            setBookingId(id);
                            setIsReviewBookingModalOpen(true);
                        }}
                    />
                )}

                {isReviewBookingModalOpen && bookingId && (
                    <ReviewBooking
                        bookingId={bookingId}
                        closeModal={() => setIsReviewBookingModalOpen(false)}
                        openReviewExperienceModal={(id) => {
                            setIsReviewBookingModalOpen(false);
                            navigate("/", { state: { bookingId: id, showReviewExperience: true } });
                        }}
                    />
                )}
            </div>

            <Contact />
            <Footer />
            <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
            {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}
        </div>
    );
};

export default BookingPage;